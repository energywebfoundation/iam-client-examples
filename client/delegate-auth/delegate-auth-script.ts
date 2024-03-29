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

import {
    rpcUrl,
    chainId,
    backendUrl,
    cacheServerUrl,
    ownerPrivateKey,
} from './config';

import axios from 'axios';
import * as emoji from 'node-emoji';
import { Keys } from '@ew-did-registry/keys';
import { providers, Wallet } from 'ethers';
import { JWT } from '@ew-did-registry/jwt';

const connectIAM = async (privateKey: string): Promise<IAM> => {

    const iamAgent: IAM = new IAM({
        rpcUrl,
        privateKey,
    });
    setCacheClientOptions(chainId, {
        url: cacheServerUrl
    });

    setChainConfig(chainId, {
        rpcUrl
    });
    
    const connectionInfos = await iamAgent.initializeConnection({
        walletProvider: WalletProvider.PrivateKey,
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

const addKeyToAssetDocument = async (assetOwner: IAM, assetAddress: string, assetPublicKey: string): Promise<boolean> => {

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
    const isDidDocUpdated = await assetOwner.updateDidDocument(didOptions);

    return isDidDocUpdated;
};

const displayError = (err: Error, step: string) => {
    console.log(`${emoji.get('red_circle')} [ ${step} ] : \x1b[31m%s\x1b[0m`, `: ${err}\n`);
};

const connectToBackend = async (token: string, backendUrl: string) : Promise<string> => {
    const response = await axios.post<{ token: string }>(
        `${backendUrl}/login`,
        {
            identityToken: token,
        },
        { withCredentials: true }
    );
    return response.data.token;
}

(async () => {
    try {
        const assetOwner = await connectIAM(ownerPrivateKey);
        try {
            const { assetAddress, assetPubKey, assetPrivKey } = await registerAsset(assetOwner);

            try {
                // Adding the new key to the assets verification methods
                const isDidDocUpdated = await addKeyToAssetDocument(assetOwner, assetAddress!, assetPubKey!);
                console.log(`${emoji.get('large_green_circle')} Key added to Asset's DID: \x1b[32m%s\x1b[0m\n`, isDidDocUpdated);

                try {
                    const assetDid = `did:ethr:${assetAddress}`;

                    const identityToken = await assetOwner.createDelegateProof(
                        assetPrivKey as string,
                        "https://volta-rpc.energyweb.org",
                        assetDid as string,
                    );

                    if (identityToken) {
                        try {
                            const token = await connectToBackend(identityToken, backendUrl);
                            console.log(`${emoji.get('large_green_circle')} Delegate asset connected !`) 
                            console.log(`\n\t${emoji.get('memo')}  Received token : \x1b[32m%s\x1b[0m\n`, token);

                        } catch (error) {
                            const err: Error = error as Error;
                            displayError(err, "Loging to Backend");
                        }
                    }
                } catch (error) {
                    const err: Error = error as Error
                    displayError(err, "Connecting IAM instance");
                }
            } catch (error) {
                const err: Error = error as Error
                displayError(err, "UpdateDocument");
            }
        } catch (error) {
            const err: Error = error as Error
            displayError(err, "RegisterAsset");
        }
    } catch (error) {
        const err: Error = error as Error
        displayError(err, "InitializeConnection");
    }
})();
