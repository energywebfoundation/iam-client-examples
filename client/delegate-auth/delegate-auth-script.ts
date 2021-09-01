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
} from 'iam-client-lib';


(async () => {
    const privateKey = '14c4ce13e2ab410ac230f40a803bb2e978feaf6bd847bf0712087189d7493aa1'
    const newIam = new IAM({
        rpcUrl: "https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org",
        privateKey,
    })
    await newIam.initializeConnection({
        initCacheServer: false,
        createDocument: false
    })
    const did = newIam.getDid();
    console.log(did);
    //const doc = newIam.getDidDocument();
})();