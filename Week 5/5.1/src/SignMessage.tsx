import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useState } from "react";

export default function SignMessage() {
  const message = "Hello World";
  const { publicKey, signMessage, connected } = useWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleSignMessage = async () => {
    if (!connected || !publicKey || !signMessage) {
      setError("Wallet not connected or signMessage not supported");
      return;
    }

    try {
      setError(null);
      const msg = new TextEncoder().encode(message);
      const messageBase64 = Buffer.from(msg).toString("base64");
      const signed = await signMessage(msg);
      const encoded = bs58.encode(signed);
      const response: any = await fetch("http://localhost:5000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageBase64,
          signature: encoded,
          publicKey: publicKey,
        }),
      });
      const verifySignature = await response.json();
      if (!verifySignature.success) {
        throw new Error(verifySignature.msg);
      }
      setSignature(encoded);
    } catch (err: any) {
      setError(err.message || "Failed to sign message");
      console.error(err);
    }
  };
  return (
    <div>
      <h1>Sign Message</h1>
      <button onClick={handleSignMessage}>Sign "Hello World"</button>

      {signature && (
        <div>
          <p>✅ Signature: {signature}</p>
          <p>✅ Verification Success</p>
        </div>
      )}

      {error && <p>⚠️ Error: {error}</p>}
    </div>
  );
}
