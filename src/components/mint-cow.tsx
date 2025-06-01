import { Button } from "./ui/button"
import { useAccount, useWalletClient } from 'wagmi'
import { useState } from 'react'
import { mintCowNFT } from '../lib/contracts'
import { useToast } from "./ui/use-toast"

export function MintCow() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [isMinting, setIsMinting] = useState(false);
    const { toast } = useToast();

    const handleMint = async () => {
        if (!address || !walletClient) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive"
            });
            return;
        }

        setIsMinting(true);
        try {
            const tx = await mintCowNFT(walletClient, address);
            console.log('Mint transaction:', tx);
            
            toast({
                title: "Success! 🐄",
                description: "Your cow NFT has been minted successfully!",
            });

            // Wait for transaction to be mined
            const receipt = await walletClient.waitForTransactionReceipt({ hash: tx });
            console.log('Transaction receipt:', receipt);

            // Refresh the page to show the new cow
            window.location.reload();
        } catch (error) {
            console.error('Error minting cow:', error);
            toast({
                title: "Error",
                description: "Failed to mint cow NFT. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <Button
            onClick={handleMint}
            disabled={isMinting || !address}
            className="bg-purple-600 hover:bg-purple-700"
        >
            {isMinting ? "Minting..." : "Mint a Cow"}
        </Button>
    );
} 