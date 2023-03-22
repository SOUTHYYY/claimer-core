import * as dotenv from 'dotenv'

dotenv.config();

export const envReader = {
  ArbitrumTokenAddress: process.env.ARBITRUM_TOKEN_ADDRESS ?? '0x912ce59144191c1204e64559fe8253a0e49e6548',
  TokenDistributorAddress: process.env.TOKEN_DISTRIBUTOR_ADDRESS ?? '0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9',
  WalletAddress: process.env.WALLET_ADDRESS ?? '',
  RpcUrl: process.env.RPC_URL ?? '',
  ArbitrumReceiverAddress: process.env.ARBITRUM_RECEIVER_ADDRESS ?? '',
  PrivateKey: process.env.PRIVATE_KEY ?? ''
}