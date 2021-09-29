import axios from 'axios';
import { backendUrl, userPrivateKey, } from './config';
import { generateIdentity } from './generate-identity';

const jwtLogin = async () : Promise<void> => {
    if (!userPrivateKey){
        throw("You must set a valid privateKey");
    }
    const identityToken = await generateIdentity(userPrivateKey);
    const response = await axios.post(`${backendUrl}/login`, {identityToken});
    console.log("Passport-JWT- Response: ", response.data);
}

jwtLogin();
