import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import WalletInfo from "../components/WalletInfo";
import ConnectWallet from "../components/ConnectWallet";
import ManualWalletEntry from "../components/ManualWalletEntry";
import ClaimTokens from "../components/ClaimTokens";
import { useWallet } from "../providers/WalletProvider";
import { getClaimAmount } from "../utils/api";
import { FaucetResult, WalletAddress } from "../types/faucet";
import "../styles/index.css";

const Home = () => {
    const {
        setInitializeWalletProvider,
        walletAddress,
        connectWallet,
        connectManual,
        disconnectWallet,
        isOnAlpenTestnet,
        switchToAlpenTestnet,
    } = useWallet();
    const [manualEntry, setManualEntry] = useState(false);
    const [walletTriedToConnect, setWalletTriedToConnect] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [claimAmount, setClaimAmount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimAmountError, setClaimAmountError] = useState(false);

    // Fetch claimable amount on load
    useEffect(() => {
        if (!walletAddress) return; // only run when wallet is connected

        if (walletAddress && isOnAlpenTestnet && !manualEntry) {
            setWalletConnected(true);
        } else {
            setWalletConnected(false);
        }

        async function fetchAmount() {
            setLoading(true);
            try {
                const res: FaucetResult<string> = await getClaimAmount("l2");
                if (res.ok) {
                    const sats = parseInt(res.data, 10);
                    const btc = (sats / 100_000_000).toFixed(2);
                    console.log(`Claim amount: ${btc} BTC`);
                    setClaimAmount(btc);
                    setClaimAmountError(false);
                } else {
                    console.error("Failed to fetch claim amount:", res.error);
                    setClaimAmount(null);
                    setClaimAmountError(true);
                }
            } catch (err) {
                console.error("Failed to fetch claim amount:", err);
                setClaimAmount(null);
                setClaimAmountError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchAmount();
    }, [manualEntry, walletAddress, isOnAlpenTestnet]);

    const handleManualConnect = (address: WalletAddress) => {
        connectManual(address);
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setManualEntry(false);
        setWalletConnected(false);
        setInitializeWalletProvider(false);
    };

    return (
        <>
            <Header />

            {/* Show wallet info at top-right when connected */}
            {walletConnected && walletAddress && (
                <WalletInfo
                    address={walletAddress}
                    onDisconnect={handleDisconnect}
                />
            )}

            <div className="container">
                {!walletAddress ? (
                    <>
                        {!manualEntry &&
                            walletTriedToConnect &&
                            walletAddress &&
                            !isOnAlpenTestnet && (
                                <div className="networkErrorContainer">
                                    <div className="networkErrorBox">
                                        <span className="networkErrorTitle">
                                            Wrong network
                                        </span>
                                        <p className="networkErrorText">
                                            Your wallet is connected to the
                                            wrong network. Please switch your
                                            wallet to use the Alpen Testnet
                                            network.
                                            <br />
                                            <a
                                                href="https://docs.alpenlabs.io/welcome/wallet-setup"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="networkErrorLink"
                                            >
                                                Learn more
                                            </a>
                                        </p>
                                        <button
                                            className="switchButton"
                                            onClick={switchToAlpenTestnet}
                                        >
                                            Switch
                                        </button>
                                    </div>
                                </div>
                            )}
                        {!manualEntry ? (
                            <ConnectWallet
                                onConnect={async () => {
                                    setInitializeWalletProvider(true);
                                    await connectWallet();
                                    setWalletTriedToConnect(true);
                                }}
                                onManual={() => setManualEntry(true)}
                            />
                        ) : (
                            <ManualWalletEntry
                                onManualConnect={handleManualConnect}
                            />
                        )}
                    </>
                ) : isOnAlpenTestnet ? (
                    <ClaimTokens
                        walletAddress={walletAddress!}
                        claimAmount={claimAmount}
                        manualEntry={manualEntry}
                        claimAmountError={claimAmountError}
                    />
                ) : null}
            </div>
        </>
    );
};

export default Home;
