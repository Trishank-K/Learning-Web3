import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function Balance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error("Error getting balance");
        }
      }
    };
    fetchBalance();
  },[publicKey,connection]);
  return <div>
    {publicKey?(
        <p>Balance: {balance != null ? `${balance} SOL`:'Loading'}</p>
    ):(
        <p>Connect Wallet to see Balance</p>
    )}
  </div>;
}
