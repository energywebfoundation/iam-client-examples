import { utils, Wallet } from 'ethers';

export const generateIdentity = async (privateKey : string) : Promise<string> => {
  const signer = new Wallet(privateKey);
  
  const header = {
      alg: 'ES256',
      typ: 'JWT'
  };

  const encodedHeader = utils.base64.encode(Buffer.from(JSON.stringify(header)));

  const address = await signer.getAddress();
  const did = `did:ethr:${address}`;

  const payload = {
      iss: did,
      claimData: {
          blockNumber: 999999999999
      }
  };

  const encodedPayload = utils.base64.encode(Buffer.from(JSON.stringify(payload)));

  const message = utils.arrayify(
      utils.keccak256(Buffer.from(`${encodedHeader}.${encodedPayload}`))
  );
  const sig = await signer.signMessage(message);
  const encodedSig = utils.base64.encode(Buffer.from(sig));

  return `${encodedHeader}.${encodedPayload}.${encodedSig}`;
};