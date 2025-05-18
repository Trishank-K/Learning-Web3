import { AccountLayout, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  GetProgramAccountsResponse,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Token() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [token, setToken] =
    useState<RpcResponseAndContext<GetProgramAccountsResponse>>();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>();
  const [sign, setSign] = useState<any>();
  const transaction = new Transaction();
  useEffect(() => {
    setError(null);
    const getTokenAccounts = async () => {
      setError(null);
      if (!wallet || !wallet.publicKey || !connection) {
        setError("Wallet not Connected");
        return;
      }
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
      setToken(tokenAccounts);
    };
    getTokenAccounts();
  }, [connection, wallet]);

  const SendTokens = async (tokenAccountAddress: string) => {
    setError(null);
    if (!wallet || !wallet.publicKey || !connection) {
      setError("Wallet not Connected");
      return;
    }
    transaction.add(
      createTransferInstruction(new PublicKey(tokenAccountAddress),new PublicKey(to),wallet.publicKey,amount,[],TOKEN_PROGRAM_ID)
    )
    const signature = await wallet.sendTransaction(transaction, connection);
    setSign(signature);
  };
  return (
    <div>
      {error && <div>{error}</div>}
      {!error && (
        <>
          <p>Your Tokens:</p>
          {token?.value.map((tokenAccount, idx) => {
            const accountData = AccountLayout.decode(tokenAccount.account.data);
            return (
              <div
                key={idx}
                style={{ display: "flex", gap: "8px", padding: "8px" }}
              >
                <p>{new PublicKey(accountData.mint).toString()}</p>
                <p>
                  {parseInt(accountData.amount.toString()) / LAMPORTS_PER_SOL}
                </p>
                <input
                  type="text"
                  placeholder="Recepient Address"
                  onChange={(e) => setTo(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="amount"
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                />
                <button
                  onClick={() => SendTokens(tokenAccount.pubkey.toString())}
                >
                  Send
                </button>
              </div>
            );
          })}
          {sign&&<div>
            Transaction Complete: {sign.toString()}
            </div>
            }
          {!token && <p>You have No Tokens</p>}
        </>
      )}
    </div>
  );
}