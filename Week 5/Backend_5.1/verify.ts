import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import * as ed from "@noble/ed25519";
import { Buffer } from "buffer";

import { sha512 } from "@noble/hashes/sha2";

ed.etc.sha512Sync = sha512;


const verifySignature = async (messageBase64:string, signature:string, publicKey: PublicKey) => {
  try {
    const message = Uint8Array.from(Buffer.from(messageBase64, "base64"));
    const pubKey = new PublicKey(publicKey).toBytes();
    const sign = bs58.decode(signature);

    if (sign.length !== 64) throw new Error("Invalid signature length");
    if (pubKey.length !== 32) throw new Error("Invalid public key length");

    const isValid = ed.verify(sign, message, pubKey);
    return isValid;
  } catch (err) {
    console.error("Verification failed:", err);
    return false;
  }
};
export default verifySignature