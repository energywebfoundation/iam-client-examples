// In other words, we need to have an example application which does the following:

// Creates an IAM (from iam-client-lib) instance representing an asset owner

// Creates a new asset using iam-client-lib registerAsset()

// Generates a new secp256k1 keypair

// Adds the new key to the assets verification methods (see switchboard-dapp/verification.service.ts at 30aeaa15477709ef8a63504dcc707d81a20ce483 · energywebfoundation/switchboard-dapp  for example for how this is done in Switchboard)

// Creates an IAM instance representing an asset using the private key from generate keypair

// Creates an identity token (or uses token from iam initialization) and authenticates as the asset DID to the iam-client-examples backend

// To start the nodejs “app” could just be a script that runs through the above steps and outputs logs describing what is happening. (It would be awesome if the logs had emojis   )

const express = require('express');
const emoji = require('node-emoji');
const { config } = require('dotenv');
const { Keys } = require('@ew-did-registry/keys');
const {
    ethrReg,
    Operator,
    IdentityOwner,
    EwPrivateKeySigner,
} = require('@ew-did-registry/did-ethr-resolver');
const { Methods } = require('@ew-did-registry/did');
const { ProviderTypes } = require('@ew-did-registry/did-resolver-interface');
const {
    IAM,
    Encoding,
    Algorithms,
    PubKeyType,
    DIDAttribute,
    setChainConfig,
    setCacheClientOptions,
} = require('iam-client-lib');
config({path: '../.env'});
const delegateAuth = express();

const defaultPort = 4242;

const owner = IdentityOwner.fromPrivateKeySigner(
    new EwPrivateKeySigner(
        process.env.ASSET_OWNER_PRIVATE_KEY,
        {
            type: ProviderTypes.HTTP,
            uriOrInfo: "https://volta-identitycache.energyweb.org/",
        })
)
// const operator = new Operator(owner, {
//     method: Methods.Erc1056,
//     abi: ethrReg.abi,
//     // address: "did registry address"
// })

const getUpdateData = (publicKey) => {
    return {
        algo: Algorithms.ED25519,
        type: PubKeyType.VerificationKey2018,
        encoding: Encoding.HEX,
        value: publicKey,
        delegate: '0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
    };
  };

  setCacheClientOptions(
      73799,
      {
          url: "https://volta-identitycache.energyweb.org/",
      }
  )

  setChainConfig(73799), {
      rpcUrl: "https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org"
  };

const createIam = (privateKey) => {
    const newIam = new IAM({
        rpcUrl: "https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org",
        privateKey,
    })
    return newIam;
};

delegateAuth.listen(process.env.PORT || defaultPort, async () => {
    console.log(`${emoji.get('heart')}  Delegate-auth app is listenning on port ${defaultPort}`);
    
    const iamAssetOwner = createIam(process.env.ASSET_OWNER_PRIVATE_KEY);
    const connexionInfos = await iamAssetOwner.initializeConnection({
        createDocument: true,
        initCacheServer: true,
    })
    const signer = iamAssetOwner.getSigner()
    await iamAssetOwner.connectToCacheServer()
    const {did} = connexionInfos;

    const keyPair = new Keys();
    console.log(),
    // console.log(connexionInfos);
    console.log("####", connexionInfos.didDocument);
    try {
        const updateOptions = {}
        // const asset = await iamAssetOwner.registerAsset();
        // console.log("####", asset)
        // await operator.update(did, DIDAttribute.Authenticate, getUpdateData(keyPair.publicKey))
        // const updateStatus = await iamAssetOwner.updateDidDocument(updateOptions)
        // console.log(`Is document updated ? => ${updateStatus}`);
    } catch(err) {
        console.log("[registerAsset] ** there were an error: ", err)
    }
    
})