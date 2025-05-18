import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import type { TokenMetadata } from "@solana/spl-token-metadata";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  createMintToInstruction,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { Label } from "./ui/labe";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const loadingStates = [
  { text: "Validating wallet connection..." },
  { text: "Generating mint keypair and preparing metadata..." },
  { text: "Calculating rent exemption..." },
  { text: "Creating mint account on-chain..." },
  { text: "Initializing metadata pointer..." },
  { text: "Initializing mint..." },
  { text: "Writing metadata to mint..." },
  { text: "Signing and sending creation transaction..." },
  { text: "Creating associated token account..." },
  { text: "Minting tokens to wallet..." },
  { text: "Finalizing and confirming transactions..." },
];

export function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const handleCreateToken = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      setIndex(0);
      if (!wallet.publicKey) {
        setError("Wallet Not Connected!");
        return;
      }

      setIndex(1);
      const payer = wallet.publicKey;
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      const decimals = 2;
      const mintAuthority = wallet.publicKey;
      const updateAuthority = wallet.publicKey;

      const metaData: TokenMetadata = {
        updateAuthority,
        mint,
        name: name || "TOKEN_TEMP",
        symbol: symbol || "TX",
        uri:
          image ||
          "https://i.ytimg.com/vi/eXwZMAz9Vh8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAVeD81lYf_ygdk1dICZMM1AtEY0w",
        additionalMetadata: [["description", "Kuch bhi"]],
      };

      setIndex(2);
      const metadataLen = pack(metaData).length;
      const metadataExtensions = 2 + 4;
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtensions + metadataLen
      );

      setIndex(3);
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });

      setIndex(4);
      const initializeMetadataPointerInstruction =
        createInitializeMetadataPointerInstruction(
          mint,
          updateAuthority,
          mint,
          TOKEN_2022_PROGRAM_ID
        );

      setIndex(5);
      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        decimals,
        mintAuthority,
        null,
        TOKEN_2022_PROGRAM_ID
      );

      setIndex(6);
      const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority,
        mint,
        mintAuthority,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      });

      setIndex(7);
      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        initializeMintInstruction,
        initializeMetadataInstruction
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);

      const transactionSignature = await wallet.sendTransaction(
        transaction,
        connection
      );
      if (!transactionSignature) {
        setError("Transaction did not Succeed");
      }

      setIndex(8);
      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );
      await wallet.sendTransaction(transaction2, connection);

      setIndex(9);
      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          supply * 100,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction3, connection);
      setIndex(10);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsOpen(true);
      setLoading(false);
      setSuccess("Mint Success");
      console.log("Transaction signature:", transactionSignature);
    } catch (err) {
      console.error(err);
      setError("Error occurred: " + (err as any).message);
      setLoading(false);
      setIsOpen(true);
    }
  };

  return (
    <div>
      <Loader loadingStates={loadingStates} value={index} loading={loading} />
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => {
          setError("");
          setSuccess("");
          setIsOpen(false)
        }}
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-0"
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              className={`w-full max-w-md rounded-xl p-6 backdrop-blur-2xl transition-all duration-300 ease-out ${
                error ? "bg-red-900/80" : "bg-emerald-900/80"
              } border border-white/10`}
            >
              <DialogTitle as="h3" className="text-lg font-bold text-white">
                {error
                  ? "❌ Token Creation Failed"
                  : "✅ Token Successfully Created"}
              </DialogTitle>
              <p className="mt-3 text-sm text-white/80">
                {error
                  ? `We encountered a problem while creating your token: ${error}. Please double-check your wallet connection, input values, and try again.`
                  : `Your token has been minted successfully to your wallet. All associated transactions were confirmed on the Solana blockchain.`}
              </p>
              <div className="mt-5">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-inner shadow-white/10 hover:bg-gray-600"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setIsOpen(false)
                  }}
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <form className=" space-y-8">
        <div className=" flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              placeholder="('_') Token"
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input
              id="symbol"
              placeholder="(^_^) Symbol"
              type="text"
              onChange={(e) => setSymbol(e.target.value)}
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="">
          <Label htmlFor="url">Token Image url</Label>
          <Input
            id="url"
            placeholder="🖼 URL"
            type="text"
            onChange={(e) => setImage(e.target.value)}
          />
        </LabelInputContainer>
        <LabelInputContainer className="">
          <Label htmlFor="supply">Supply</Label>
          <Input
            id="supply"
            placeholder="ᕙ⁠(⁠ ⁠ ⁠•⁠ ⁠‿⁠ ⁠•⁠ ⁠ ⁠)⁠ᕗ Amount to be Minted"
            type="number"
            onChange={(e) => setSupply(parseInt(e.target.value))}
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          onClick={handleCreateToken}
          type="button"
        >
          Create Token &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
