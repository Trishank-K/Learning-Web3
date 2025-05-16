import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";

export function Airdrop() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function airdrop() {
    setSuccess(false);
    setError("");

    if (!publicKey) {
      setError("Wallet not connected.");
      return;
    }

    console.log("Requesting airdrop for PublicKey:", publicKey.toBase58());
    console.log("Requested Amount (SOL):", amount);
    console.log("Requested Amount (Lamports):", amount * LAMPORTS_PER_SOL);

    try {
      const sig = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      console.log("Airdrop signature:", sig);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Airdrop failed. Check console for details.");
    }
  }

  return (
    <div>
      <input
        type="number"
        placeholder="Amount of SOL"
        onChange={(e) => {
          setAmount(Number(e.target.value));
        }}
      />
      <button onClick={airdrop}>Request Airdrop</button>

      {success && <p>Airdrop of {amount} SOL successful! 🎉</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
