<template>
  <div>
    <div v-if="isLoading">
      <Spinner />
      <span>
        Loading... (Please sign messages using your connected wallet)
      </span>
    </div>
    <div v-else-if="did">
      <p>Hello user!</p>
      <p>
        Your decentralised identifier: <strong>{{ did }}</strong>
      </p>
      <div v-if="roles.length > 0" class="rolesContainer">
        <p>This are your validated roles:</p>
        <p v-for="(role, index) in roles" v-bind:key="index + role.name">
          <strong>{{ role.name }}</strong> at {{ role.namespace }}
        </p>
      </div>
      <div v-else>
        You do not have any issued role at the moment, please login into
        switchboard and search for apps, orgs to enrol.
      </div>
      <div class="logoutContainer">
        <a v-if="enrolmentUrl" :href="enrolmentUrl" class="button">
          <span>Enrol to test role</span>
        </a>
        <button @click="logout" class="button">
          <span>Logout</span>
        </button>
      </div>
    </div>
    <div v-else>
      <div v-if="errored">
        <p>
          Error occured with login.<br />
          If you rejected the signing requests, please try again and accept.<br />
          If this is your first time logging in, your account needs a small
          amount of Volta token to create a DID Document.<br />
          A Volta token can be obtained from the
          <a href="https://voltafaucet.energyweb.org/">Volta Faucet</a>.
        </p>
      </div>
      <div v-if="unauthorized">
        <p>
          Unauthorized login response.
          <br />
          Please ensure that you have the necessary role claim.
        </p>
        <div v-if="enrolmentUrl" class="enrolbuttonContainer">
          <p>
            Use enrolment button to request necessary role.
          </p>
          <a :href="enrolmentUrl" class="button">
            <span>Enrol to test role</span>
          </a>
        </div>
      </div>
      <div class="container">
        <button
          @click="login({ providerType: 'WalletConnect' })"
          class="button"
        >
          <img class="walletconnect" src="../assets/wallet-connect-icon.svg" />
          <span>Login with Wallet Connect</span>
        </button>
        <button @click="login({ providerType: 'MetaMask' })" class="button">
          <img class="metamask" src="../assets/metamask-logo.svg" />
          <span>Login with Metamask</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Spinner from "./Spinner.vue";
import axios from "axios";
import { config } from "../config";
import {
  initWithMetamask,
  initWithWalletConnect,
  ProviderType,
  SignerService,
} from "iam-client-lib";

type Role = {
  name: string;
  namespace: string;
};

export default Vue.extend({
  name: "Main",
  components: {
    Spinner,
  },
  data: function(): {
    isLoading: boolean;
    errored: boolean;
    signerService?: SignerService;
    unauthorized: boolean;
    did?: string;
    roles: Role[] | [];
    enrolmentUrl?: string;
  } {
    return {
      isLoading: false,
      errored: false,
      unauthorized: false,
      signerService: undefined,
      did: localStorage.did,
      roles: localStorage.roles ? JSON.parse(localStorage.roles) : [],
      enrolmentUrl: config.enrolmentUrl
        ? `${config.enrolmentUrl}&returnUrl=${encodeURIComponent(
            window.location.href
          )}`
        : "",
    };
  },
  async created() {
    const loginStatus = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/login-status`, {
          withCredentials: true,
        });
        const { loginStatus } = res.data;
        if (!loginStatus) {
          this.logout();
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          this.logout();
        }
      }
    };
    loginStatus();
  },
  methods: {
    initSignerService: async function(providerType: ProviderType) {
      switch (providerType) {
        case ProviderType.MetaMask:
          return initWithMetamask();
        case ProviderType.WalletConnect:
          return initWithWalletConnect();
        default:
          throw new Error(`no handler for provider '${providerType}'`);
      }
    },

    login: async function({ providerType }: { providerType: ProviderType }) {
      this.isLoading = true;
      this.errored = false;
      this.unauthorized = false;
      try {
        this.signerService = (
          await this.initSignerService(providerType)
        ).signerService;
        this.did = this.signerService.did;
        localStorage.setItem("did", this.signerService.did);

        const {
          identityToken,
        } = await await this.signerService.publicKeyAndIdentityToken();
        if (identityToken) {
          await axios.post(
            `${config.backendUrl}/login`,
            {
              identityToken,
            },
            { withCredentials: true }
          );
        }

        const { data: roles } = await axios.get<Role[]>(
          `${config.backendUrl}/roles`,
          { withCredentials: true }
        );

        this.roles = roles;
        localStorage.setItem("roles", JSON.stringify(roles));
        this.isLoading = false;
      } catch (err) {
        console.log(err);
        this.did = undefined;
        if (err?.response?.status === 401) {
          this.unauthorized = true;
        } else {
          this.errored = true;
        }
      }
      this.isLoading = false;
    },
    logout: async function() {
      this.signerService && this.signerService.closeConnection();
      this.did = "";
      localStorage.clear();
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.container {
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
}
.rolesContainer {
  margin-top: 24px;
}
.logoutContainer {
  display: flex;
  justify-content: center;
}
.enrolbuttonContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.button {
  background-color: #42b883;
  padding: 20px 24px;
  margin: 8px;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  display: flex;
  align-items: center;
  text-decoration: none;
  &:hover {
    background-color: #3b9d71;
  }

  img {
    margin-right: 16px;
  }

  .metamask {
    height: 36px;
    width: 36px;
  }

  .walletconnect {
    height: 48px;
    width: 48px;
  }
}

a {
  color: #42b883;
}
</style>
