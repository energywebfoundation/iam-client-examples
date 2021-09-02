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
    Asset,
    Encoding,
    PubKeyType,
    Algorithms,
    DIDAttribute,
    setChainConfig,
    setCacheClientOptions,
} from 'iam-client-lib';
import * as emoji from 'node-emoji';
import { Keys } from '@ew-did-registry/keys';

const connectIAM = async (): Promise<IAM> => {
    const privateKey = '14c4ce13e2ab410ac230f40a803bb2e978feaf6bd847bf0712087189d7493aa1';

    setCacheClientOptions(73799, {
        url: "https://volta-identitycache.energyweb.org/",
    })

    setChainConfig(73799, {
        rpcUrl: "https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org"
    });

    const assetOwner: IAM = new IAM({
        rpcUrl: "https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org",
        privateKey,
    })

    const connexionInfos = await assetOwner.initializeConnection({
        initCacheServer: false,
        createDocument: false,
    })

    console.log(`${emoji.get('large_green_circle')} IAM Owner created \x1b[32m%s\x1b[0m`, `\n`);
    console.log(`\t${emoji.get('scroll')} owner DID: \x1b[32m%s\x1b[0m`, `${connexionInfos.did}\n`);
    console.log(`\t${emoji.get('scroll')} owner identity token: \x1b[32m%s\x1b[0m`, `${connexionInfos.identityToken}\n`);

    return assetOwner;
}

const registerAsset = async (assetOwner: IAM): Promise<Partial<{assetAddress: string, assetPubKey: string}>> => {

    // Creates a new asset using iam-client-lib registerAsset()     
    const assetAddress: string = await assetOwner.registerAsset();
    console.log(`${emoji.get('large_green_circle')} Asset Registeration:\n`);
    console.log(`\t${emoji.get('hammer_and_wrench')}  Asset Created at address: \x1b[32m%s\x1b[0m`, `${assetAddress}\n`);

    // // Generates a new secp256k1 keypair
    const keyPair = new Keys();
    console.log(`\t${emoji.get('closed_lock_with_key')} Setting asset's Keypair: \x1b[32m%s\x1b[0m`, `\n`);
    console.log(`\t\t${emoji.get('key')} Private Key: \x1b[32m%s\x1b[0m`, `0x${keyPair.privateKey}\n`);
    console.log(`\t\t${emoji.get('lock')} Public Key: \x1b[32m%s\x1b[0m`, `0x${keyPair.publicKey}\n`);

    return {
        assetAddress,
        assetPubKey: keyPair.publicKey
    };
}

const addAssetInDocument = async (assetOwner: IAM, assetAddress: string, assetPublicKey: string) : Promise<boolean> => {
    const isDIdDocUpdated = await assetOwner.updateDidDocument({
        didAttribute: DIDAttribute.PublicKey,
        did: `did:ethr:${assetAddress}`,
        data: {
            algo: Algorithms.Secp256k1,
            encoding: Encoding.HEX,
            type: PubKeyType.SignatureAuthentication2018,
            value: { tag: "key-1", publicKey: `0x${assetPublicKey}` },
        },
    });

    return isDIdDocUpdated;
}

(async () => {
    try {
        // Creates an IAM (from iam-client-lib) instance representing an asset owner
        const assetOwner = await connectIAM();
        try {
            const { assetAddress, assetPubKey } = await registerAsset(assetOwner);

            try {
                // Adding the new key to the assets verification methods
                const isDIdDocUpdated = await addAssetInDocument(assetOwner, assetAddress!, assetPubKey!);
                console.log(`${emoji.get('large_green_circle')} Asset addet to DID: \x1b[32m%s\x1b[0m\n`, isDIdDocUpdated);
            }
            catch (err) {
                console.log(`${emoji.get('red_circle')} [ UpdateDocument ] : \x1b[31m%s\x1b[0m`, `: ${err}\n`);
            }
        } catch (err) {
            console.log(`${emoji.get('red_circle')} [ RegisterAsset ] : \x1b[31m%s\x1b[0m`, `: ${err}\n`);
        }
    } catch (err) {
        console.log(`${emoji.get('no_entry')} [ InitializeConnexion ] : \x1b[31m%s\x1b[0m`, `: ${err}\n`);
    }


})();