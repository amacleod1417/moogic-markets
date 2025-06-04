import { type WalletClient, defineChain } from 'viem'
import CowNFTAbi from '../artifacts/CowNFT.json'
import { COW_NFT_ADDRESS } from '../config/contracts'
import { createPublicClient, http } from 'viem'

const flareCoston2 = defineChain({
  id: 114,
  name: 'Flare Coston2',
  network: 'flare-coston2',
  nativeCurrency: {
    name: 'Coston2 FLR',
    symbol: 'C2FLR',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
})

export type CowStats = {
  milkYield: bigint
  steps: bigint
  heartRate: bigint
  lastUpdated: bigint
}

// Helper function to validate contract address
const validateAddress = (address: string) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Invalid contract address')
  }
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Invalid contract address format')
  }
}

// Helper function to validate owner address
const validateOwnerAddress = (address: string) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Invalid owner address')
  }
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Invalid owner address format')
  }
}

export const getCowNFTContract = (walletClient: WalletClient) => {
    const publicClient = createPublicClient({
        chain: flareCoston2,
        transport: http()
    })

    return {
        getBytecode: async () => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Getting contract bytecode for address:', COW_NFT_ADDRESS)
                const bytecode = await publicClient.getBytecode({
                    address: COW_NFT_ADDRESS as `0x${string}`
                })
                console.log('Contract bytecode length:', bytecode ? bytecode.length : 0)
                console.log('Contract bytecode:', bytecode)
                return bytecode
            } catch (error) {
                console.error('Error getting bytecode:', error)
                throw error
            }
        },
        name: async () => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Calling name() on contract:', COW_NFT_ADDRESS)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'name',
                    args: []
                })
                console.log('name() result:', result)
                return result
            } catch (error) {
                console.error('Error in name():', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS
                    })
                }
                throw error
            }
        },
        symbol: async () => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Calling symbol() on contract:', COW_NFT_ADDRESS)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'symbol',
                    args: []
                })
                console.log('symbol() result:', result)
                return result
            } catch (error) {
                console.error('Error in symbol():', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS
                    })
                }
                throw error
            }
        },
        balanceOf: async (address: string) => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                validateOwnerAddress(address)
                console.log('Calling balanceOf on contract:', COW_NFT_ADDRESS)
                console.log('Owner address:', address)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'balanceOf',
                    args: [address]
                })
                console.log('balanceOf result:', result)
                return result
            } catch (error) {
                console.error('Error in balanceOf:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        ownerAddress: address
                    })
                }
                throw error
            }
        },
        tokenOfOwnerByIndex: async (address: string, index: number) => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                validateOwnerAddress(address)
                console.log('Calling tokenOfOwnerByIndex on contract:', COW_NFT_ADDRESS)
                console.log('Owner address:', address, 'Index:', index)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'tokenOfOwnerByIndex',
                    args: [address, index]
                })
                console.log('tokenOfOwnerByIndex result:', result)
                return result
            } catch (error) {
                console.error('Error in tokenOfOwnerByIndex:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        ownerAddress: address,
                        index
                    })
                }
                throw error
            }
        },
        cowToVault: async (tokenId: number) => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Calling cowToVault on contract:', COW_NFT_ADDRESS)
                console.log('Token ID:', tokenId)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'cowToVault',
                    args: [tokenId]
                })
                console.log('cowToVault result:', result)
                return result
            } catch (error) {
                console.error('Error in cowToVault:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        tokenId
                    })
                }
                throw error
            }
        },
        getCowStats: async (tokenId: number): Promise<CowStats> => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Calling getCowStats on contract:', COW_NFT_ADDRESS)
                console.log('Token ID:', tokenId)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'cowStats',
                    args: [tokenId]
                })
                console.log('getCowStats result:', result)
                return result as CowStats
            } catch (error) {
                console.error('Error in getCowStats:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        tokenId
                    })
                }
                throw error
            }
        },
        mintCow: async (address: string) => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                validateOwnerAddress(address)
                console.log('Calling mintCow on contract:', COW_NFT_ADDRESS)
                console.log('Owner address:', address)
                const result = await walletClient.writeContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'mintCow',
                    args: [address],
                    chain: flareCoston2
                })
                console.log('mintCow result:', result)
                return result
            } catch (error) {
                console.error('Error in mintCow:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        ownerAddress: address
                    })
                }
                throw error
            }
        },
        tokenURI: async (tokenId: number) => {
            try {
                validateAddress(COW_NFT_ADDRESS)
                console.log('Calling tokenURI on contract:', COW_NFT_ADDRESS)
                const result = await publicClient.readContract({
                    address: COW_NFT_ADDRESS as `0x${string}`,
                    abi: CowNFTAbi.abi,
                    functionName: 'tokenURI',
                    args: [tokenId]
                })
                console.log('tokenURI result:', result)
                return result as string
            } catch (error) {
                console.error('Error in tokenURI:', error)
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        contractAddress: COW_NFT_ADDRESS,
                        tokenId
                    })
                }
                throw error
            }
        },
    }
}

export const mintCowNFT = async (walletClient: WalletClient, address: string) => {
    const cowNFT = getCowNFTContract(walletClient)
    try {
        const tx = await cowNFT.mintCow(address)
        return tx
    } catch (error) {
        console.error('Error minting Cow NFT:', error)
        throw error
    }
} 