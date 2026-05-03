import {Redis} from "ioredis";

const client=new Redis({
    password:"mypassword"
});

export default client;