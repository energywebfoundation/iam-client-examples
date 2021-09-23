// In other words, we need to have an example application which does the following:

// Creates an IAM (from iam-client-lib) instance representing an asset owner

// Creates a new asset using iam-client-lib registerAsset()

// Generates a new secp256k1 keypair

// Adds the new key to the assets verification methods (see switchboard-dapp/verification.service.ts at 30aeaa15477709ef8a63504dcc707d81a20ce483 · energywebfoundation/switchboard-dapp  for example for how this is done in Switchboard)

// Creates an IAM instance representing an asset using the private key from generate keypair

// Creates an identity token (or uses token from iam initialization) and authenticates as the asset DID to the iam-client-examples backend

// To start the nodejs “app” could just be a script that runs through the above steps and outputs logs describing what is happening. (It would be awesome if the logs had emojis   )

import {
    IAM,
    Encoding,
    PubKeyType,
    Algorithms,
    DIDAttribute,
    setChainConfig,
    WalletProvider,
    setCacheClientOptions,
} from 'iam-client-lib';
import axios from 'axios';
import * as emoji from 'node-emoji';
import { Keys } from '@ew-did-registry/keys';
import { providers, Wallet } from 'ethers';
import { InitializeData } from 'iam-client-lib/dist/src/iam';
import { JWT } from '@ew-did-registry/jwt';

// const backendUrl = 'https://did-auth-demo.energyweb.org';
const backendUrl = 'http://localhost:3333';

const connectIAM = async (privateKey: string): Promise<IAM> => {

    let connectionInfos = undefined;

    const iamAgent: IAM = new IAM({
        rpcUrl: "https://volta-rpc.energyweb.org",
        privateKey,
    });
    setCacheClientOptions(73799, {
        url: "https://identitycache-dev.energyweb.org/v1",
    });

    setChainConfig(73799, {
        rpcUrl: "https://volta-rpc.energyweb.org"
    });
    connectionInfos = await iamAgent.initializeConnection({
        walletProvider: WalletProvider.WalletConnect,
        initCacheServer: true,
        createDocument: true,
    });
    console.log(`${emoji.get('large_green_circle')} IAM Owner created \x1b[32m%s\x1b[0m`, `\n`);
    console.log(`\t${emoji.get('scroll')} owner DID: \x1b[32m%s\x1b[0m`, `${connectionInfos.did}\n`);
    console.log(`\t${emoji.get('scroll')} owner identity token: \x1b[32m%s\x1b[0m`, `${connectionInfos.identityToken}\n`);
    return iamAgent;
};

const registerAsset = async (assetOwner: IAM): Promise<Partial<{ assetAddress: string, assetPubKey: string, assetPrivKey: string }>> => {

    // Creates a new asset using iam-client-lib registerAsset()     
    const assetAddress: string = await assetOwner.registerAsset();
    console.log(`${emoji.get('large_green_circle')} Asset Registeration:\n`);
    console.log(`\t${emoji.get('hammer_and_wrench')}  Asset Created at address: \x1b[32m%s\x1b[0m`, `${assetAddress}\n`);

    // // Generates a new secp256k1 keypair
    const keyPair = new Keys();
    console.log(`\t${emoji.get('closed_lock_with_key')} Setting asset's Keypair: \x1b[32m%s\x1b[0m`, `\n`);
    console.log(`\t\t${emoji.get('key')} Private Key: \x1b[32m%s\x1b[0m`, `${keyPair.privateKey}\n`);
    console.log(`\t\t${emoji.get('lock')} Public Key: \x1b[32m%s\x1b[0m`, `${keyPair.publicKey}\n`);

    return {
        assetAddress,
        assetPubKey: keyPair.publicKey,
        assetPrivKey: keyPair.privateKey,
    };
};

const addAssetInDocument = async (assetOwner: IAM, assetAddress: string, assetPublicKey: string): Promise<boolean> => {

    const assetDid = `did:ethr:${assetAddress}`;
    const didOptions = {
        didAttribute: DIDAttribute.PublicKey,
        did: assetDid,
        data: {
            algo: Algorithms.Secp256k1,
            encoding: Encoding.HEX,
            type: PubKeyType.SignatureAuthentication2018,
            value: { tag: "key-1", publicKey: `0x${assetPublicKey}` },
        },
    }
    // Add new key to asset's DID Document
    const isDIdDocUpdated = await assetOwner.updateDidDocument(didOptions);

    return isDIdDocUpdated;
};

const displayError = (err: Error, step: string) => {
    console.log(`${emoji.get('red_circle')} [ ${step} ] : \x1b[31m%s\x1b[0m`, `: ${err}\n`);
};

const connectToBackend = async (iamAgent: IAM, token: string, backendUrl: string) => {
    console.log("Connecting Token >> ", token);
    await axios.post<{ token: string }>(
        `${backendUrl}/login`,
        {
            identityToken: token,
        },
        { withCredentials: true }
    );
}

const createIdentityProofWithDelegate = async (secp256k1PrivateKey: string, rpcUrl: string, identityProofDid: string) => {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(secp256k1PrivateKey, provider);

    const blockNumber = (await provider.getBlockNumber());

    const payload = {
        claimData: {
            blockNumber,
        },
    };
    const jwt = new JWT(wallet);
    const identityToken = await jwt.sign(payload, { issuer: identityProofDid, subject: identityProofDid });
    return {
        token: identityToken,
        payload: payload
    };
}

(async () => {
    try {
        // const ownerPrivateKey = '14c4ce13e2ab410ac230f40a803bb2e978feaf6bd847bf0712087189d7493aa1';
        const ownerPrivateKey = 'd1d4b30e82c199d4ae0624c237dbfcee889d7ecf1a610b0ce48532013d3fb11b'
        const assetOwner = await connectIAM(ownerPrivateKey);
        try {
            const { assetAddress, assetPubKey, assetPrivKey } = await registerAsset(assetOwner);

            try {
                // Adding the new key to the assets verification methods
                const isDIdDocUpdated = await addAssetInDocument(assetOwner, assetAddress!, assetPubKey!);
                console.log(`${emoji.get('large_green_circle')} Asset added to DID: \x1b[32m%s\x1b[0m\n`, isDIdDocUpdated);

                try {
                    const assetDid = `did:ethr:${assetAddress}`;
                    const { token, } = await createIdentityProofWithDelegate(assetPrivKey as string, "https://volta-rpc.energyweb.org", assetDid as string);

                    if (token) {
                        try {
                            await connectToBackend(assetOwner, token, backendUrl);
                        } catch (error) {
                            const err: Error = error as Error;
                            displayError(err, "Loging to Backend")
                        }
                    }
                } catch (error) {
                    const err: Error = error as Error
                    displayError(err, "Connecting IAM instance");
                }
            }
            catch (error) {
                const err: Error = error as Error
                displayError(err, "UpdateDocument");

            }
        } catch (error) {
            const err: Error = error as Error
            displayError(err, "RegisterAsset");
        }
    } catch (error) {
        const err: Error = error as Error
        displayError(err, "InitializeConnexion");
    }
})();