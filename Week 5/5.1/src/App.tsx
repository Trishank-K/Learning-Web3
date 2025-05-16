import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Airdrop } from "./Airdrop";
import "@solana/wallet-adapter-react-ui/styles.css";

import "./App.css";
import { Balance } from "./Balance";
import SignMessage from "./SignMessage";
import SendTokens  from "./Transaction";

function App() {
  return (
    <ConnectionProvider
      endpoint={
        "https://still-nameless-night.solana-devnet.quiknode.pro/f495688c931f5313599959f929b889508e247e31/"
      }
    >
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <WalletDisconnectButton></WalletDisconnectButton>
          <div>Hi There</div>
          <Airdrop></Airdrop>
          <Balance />
          <SendTokens />
          <SignMessage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
