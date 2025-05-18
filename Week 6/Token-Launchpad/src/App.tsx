import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { TokenLaunchpad } from "./components/TokenLaunchpad";
import { BackgroundBeams } from "./components/ui/background-beams";

function App() {
  return (
    <ConnectionProvider
      endpoint={
        "https://still-nameless-night.solana-devnet.quiknode.pro/f495688c931f5313599959f929b889508e247e31/"
      }
    >
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="w-screen h-screen bg-black relative overflow-hidden">
            <BackgroundBeams />
            <div className="relative z-10 flex flex-col justify-center items-center h-full">
              <h1 className="text-white text-3xl font-bold">
                Solana Token Launchpad
              </h1>
              <div className="space-y-8 p-12 rounded-2xl">
                <div className="flex justify-between gap-x-24">
                  <WalletMultiButton />
                  <WalletDisconnectButton />
                </div>
                <TokenLaunchpad />
              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
