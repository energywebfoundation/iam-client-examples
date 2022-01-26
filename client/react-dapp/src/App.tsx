import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "./config";

import {
  initWithEKC,
  initWithGnosis,
  initWithKms,
  initWithMetamask,
  initWithPrivateKeySigner,
  initWithWalletConnect,
  ProviderType,
  setCacheConfig,
  setChainConfig,
  SignerService,
} from "iam-client-lib";

import Spinner from "./components/Spinner";
import SourceCode from "./components/SourceCode";

import metamaskLogo from "./assets/metamask-logo.svg";
import logo from "./assets/logo.svg";
import KMLogo from "./assets/key-manager-icon.svg";
import walletconnectIcon from "./assets/wallet-connect-icon.svg";

import "./App.css";
import "./Login.css";
import { safeAppSdk } from "./gnosis.safe.service";

const { chainRpcUrl, chainId, cacheServerUrl } = config;

setCacheConfig(chainId, { url: cacheServerUrl });
setChainConfig(chainId, { rpcUrl: chainRpcUrl });

type Role = {
  name: string;
  namespace: string;
};

function App() {
  let signerService: SignerService;

  const userRoles = localStorage.getItem("roles");
  const userDID = localStorage.getItem("did") || "";
  const roles = userRoles ? (JSON.parse(userRoles) as Role[]) : [];
  const [did, setDID] = useState<string>(userDID);
  const [errored, setErrored] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(false);
  const [unauthorized, setUnauthorized] = useState<Boolean>(false);

  useEffect(() => {
    const loginStatus = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/login-status`, {
          withCredentials: true,
        });
        const { loginStatus } = res.data;
        if (!loginStatus) {
          logout();
        }
      } catch (err) {
        let httpErr = err as { response?: { status: number } };
        if (httpErr?.response?.status === 401) {
          logout();
        }
      }
    };

    loginStatus();
  });

  const initSignerService = async function(providerType: ProviderType) {
    switch (providerType) {
      case ProviderType.MetaMask:
        return initWithMetamask();
      case ProviderType.WalletConnect:
        return initWithWalletConnect();
      case ProviderType.PrivateKey:
        return initWithPrivateKeySigner(
          localStorage.getItem("PrivateKey") as string,
          chainRpcUrl
        );
      case ProviderType.Gnosis:
        return initWithGnosis(safeAppSdk);
      case ProviderType.EKC:
        return initWithEKC();
      default:
        throw new Error(`no handler for provider '${providerType}'`);
    }
  };

  const login = async function({
    providerType,
  }: {
    providerType: ProviderType;
  }) {
    setLoading(true);
    setErrored(false);
    setUnauthorized(false);
    try {
      const { signerService } = await initSignerService(providerType);
      console.log("LOGGING IN ", signerService.did);
      setDID(signerService.did);
      localStorage.setItem("did", signerService.did);
      let {
        identityToken,
      } = await await signerService.publicKeyAndIdentityToken();
      if (identityToken) {
        await axios.post<{ token: string }>(
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
      localStorage.setItem("roles", JSON.stringify(roles));
    } catch (err) {
      let httpErr = err as { response?: { status: number } };
      if (httpErr?.response?.status === 401) {
        setUnauthorized(true);
      }
      setErrored(true);
    }
    setLoading(false);
  };

  const logout = async function() {
    console.log("LOGGING OUT");
    signerService && (await signerService.closeConnection());
    setDID("");
    localStorage.clear();
  };

  const loadingMessage = (
    <div>
      <Spinner />
      <span>Loading... (Please sign messages using your connected wallet)</span>
    </div>
  );

  const enrolmentButton = config.enrolmentUrl && (
    <a
      href={`${config.enrolmentUrl}&returnUrl=${encodeURIComponent(
        window.location.href
      )}`}
      className="button"
    >
      <span>Enrol to test role</span>
    </a>
  );

  const loginResults = (
    <div>
      <p>Hello user!</p>
      <p>
        Your decentralised identifier: <br />
        <strong>{did}</strong>
      </p>
      {roles && roles.length > 0 ? (
        <div className="rolesContainer">
          <p>These are your validated roles:</p>
          {roles.map(({ name, namespace }) => (
            <p key={namespace}>
              <strong>{`${name}`}</strong>
              {` at ${namespace}`}
            </p>
          ))}
        </div>
      ) : (
        <div>
          You do not have any issued role at the moment, please login into
          switchboard and search for apps, orgs to enrol.
        </div>
      )}
      <div className="logoutContainer">
        {enrolmentButton}
        <button onClick={logout} className="button">
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const loginOptions = (
    <div className="container">
      <button
        className="button"
        onClick={async () =>
          await login({ providerType: ProviderType.WalletConnect })
        }
      >
        <img
          alt="walletconnect logo"
          className="walletconnect"
          src={walletconnectIcon}
        />
        <span>Login with Wallet Connect</span>
      </button>
      <button
        className="button"
        onClick={async () =>
          await login({ providerType: ProviderType.MetaMask })
        }
      >
        <img alt="metamask logo" className="metamask" src={metamaskLogo} />
        <span>Login with Metamask</span>
      </button>
      <button
        className="button"
        onClick={async () =>
          await login({ providerType: ProviderType.EwKeyManager })
        }
      >
        <img alt="metamask logo" className="metamask" src={KMLogo} />
        <span>Login with EW Key Manager</span>
      </button>
    </div>
  );

  const errorMessage = (
    <div>
      <p>
        Error occurred with login.
        <br />
        If you rejected the signing requests, please try again and accept.
        <br />
        If this is your first time logging in, your account needs a small amount
        of Volta token to create a DID Document.
        <br />A Volta token can be obtained from the{" "}
        <a href="https://voltafaucet.energyweb.org/">Volta Faucet</a>.
      </p>
      {loginOptions}
    </div>
  );

  const unauthorizedMessage = (
    <div>
      <p>
        Unauthorized login response.
        <br />
        Please ensure that you have the necessary role claim.
      </p>
      <div className="enrolbuttonContainer">
        {config.enrolmentUrl && (
          <p>Use enrolment button to request necessary role.</p>
        )}
        {enrolmentButton}
      </div>
      {loginOptions}
    </div>
  );

  const loginJsx = () => {
    if (loading) {
      return loadingMessage;
    }
    if (unauthorized) {
      return unauthorizedMessage;
    }
    if (errored) {
      return errorMessage;
    }
    if (did) {
      return loginResults;
    }
    return loginOptions;
  };

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>IAM showcase app</h2>
      {loginJsx()}
      <SourceCode />
    </div>
  );
}

export default App;
