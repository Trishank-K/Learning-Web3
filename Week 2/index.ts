import {Keypair} from "@solana/web3.js"
import nacl from "tweetnacl"
import bs58 from "bs58"

const keypair = Keypair.generate();


const publicKey = keypair.publicKey.toString();
const secretKey = keypair.secretKey;

console.log("Public Key: ",keypair.publicKey.toString());
console.log("Secret Key: ",secretKey)
console.log("Public Key: ",keypair.publicKey.toBytes());

const message = new TextEncoder().encode("Hello World");
console.log("message",message)
const signature = nacl.sign.detached(message,secretKey);


const result = nacl.sign.detached.verify(
    message,
    signature,
    keypair.publicKey.toBytes(),
);
console.log(result);