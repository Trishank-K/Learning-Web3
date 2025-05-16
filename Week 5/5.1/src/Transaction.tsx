import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState } from "react";

export function SendTokens() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [to, setTo] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [success, setSuccess] = useState<string | null>();
  const [error, setError] = useState<string | null>();
  const transaction = new Transaction();
  async function send() {
    setError(null);
    setSuccess(null);
    if (!wallet.publicKey || !to || !amount) {
      setError("Data Invalid");
      return;
    }
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const response = await wallet.sendTransaction(transaction, connection);
    if (!response) {
      setError("Transaction Failed");
    }
    setSuccess("Transaction Complete");
  }
  return (
    <div>
      <input
        type="text"
        placeholder="Recepient Address"
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />
      <button onClick={send}>Send Solana</button>
      {error && (
        <div>
          <p>Error Occured:{error}</p>
        </div>
      )}
      {success && (
        <div>
          <p>{success}</p>
        </div>
      )}
    </div>
  );
}
export default SendTokens;
