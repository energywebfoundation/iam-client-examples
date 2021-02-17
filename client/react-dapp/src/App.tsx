import React, { useState } from 'react'
import axios from 'axios'
import { IAM, CacheServerClient, WalletProvider } from 'iam-client-lib'

import Spinner from './components/Spinner'
import SourceCode from './components/SourceCode'

import { config } from './config'

import metamaskLogo from './assets/metamask-logo.svg'
import logo from './assets/logo.svg'
import KMLogo from './assets/key-manager-icon.svg'
import walletconnectIcon from './assets/wallet-connect-icon.svg'

import './App.css'
import './Login.css'

const iam = new IAM({
  rpcUrl: 'https://volta-rpc.energyweb.org',
  chainId: 73799,
  cacheClient: new CacheServerClient({
    url: 'https://volta-identitycache.energyweb.org/',
  }),
})

type Role = {
  name: string
  namespace: string
}

function App() {
  const [roles, setRoles] = useState<Role[]>([])
  const [did, setDID] = useState<string>('')
  const [errored, setErrored] = useState<Boolean>(false)
  const [loading, setLoading] = useState<Boolean>(false)
  const [unauthorized, setUnauthorized] = useState<Boolean>(false)

  const login = async function (initOptions?: {
    walletProvider: WalletProvider
  }) {
    setLoading(true)
    setErrored(false)
    setUnauthorized(false)
    try {
      const { identityToken, did } = await iam.initializeConnection(initOptions)

      if (did) {
        setDID(did)
      }
      if (identityToken) {
        await axios.post<{ token: string }>(`${config.backendUrl}/login`, {
          identityToken,
        })
      }

      const { data: roles } = await axios.get<Role[]>(
        `${config.backendUrl}/roles`
      )

      setRoles(roles)
    } catch (err) {
      if (err?.response?.status === 401) {
        setUnauthorized(true)
      }
      setErrored(true)
    }
    setLoading(false)
  }

  const logout = async function () {
    setDID('')
    await iam.closeConnection()
  }

  const loadingMessage = (
    <div>
      <Spinner />
      <span>Loading... (Please sign messages using your connected wallet)</span>
    </div>
  )

  const enrolmentButton = config.enrolmentUrl && (
    <a
      href={`${config.enrolmentUrl}&returnUrl=${encodeURIComponent(
        window.location.href
      )}`}
      className="button"
    >
      <span>Enrol to test role</span>
    </a>
  )

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
  )

  const loginOptions = (
    <div className="container">
      <button
        className="button"
        onClick={async () =>
          await login({ walletProvider: WalletProvider.WalletConnect })
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
          await login({ walletProvider: WalletProvider.MetaMask })
        }
      >
        <img alt="metamask logo" className="metamask" src={metamaskLogo} />
        <span>Login with Metamask</span>
      </button>
      <button
        className="button"
        onClick={async () =>
          await login({ walletProvider: WalletProvider.EwKeyManager })
        }
      >
        <img alt="metamask logo" className="metamask" src={KMLogo} />
        <span>Login with EW Key Manager</span>
      </button>
    </div>
  )

  const errorMessage = (
    <div>
      <p>
        Error occurred with login.
        <br />
        If you rejected the signing requests, please try again and accept.
        <br />
        If this is your first time logging in, your account needs a small amount
        of Volta token to create a DID Document.
        <br />A Volta token can be obtained from the{' '}
        <a href="https://voltafaucet.energyweb.org/">Volta Faucet</a>.
      </p>
      {loginOptions}
    </div>
  )

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
  )

  const loginJsx = () => {
    if (loading) {
      return loadingMessage
    }
    if (unauthorized) {
      return unauthorizedMessage
    }
    if (errored) {
      return errorMessage
    }
    if (did) {
      return loginResults
    }
    return loginOptions
  }

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>IAM showcase app</h2>
      {loginJsx()}
      <SourceCode />
    </div>
  )
}

export default App
