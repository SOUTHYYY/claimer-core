import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import { Abi as TokenDistributorAbi } from './abi/tokenDistributor';
import { Abi as ERC20Abi } from './abi/erc20';
import { envReader } from './envReader';
import { waitAndClaim } from './waitAndClaim';
import { AddressType } from './Address.type';

dotenv.config();

(async () => {
  try {
    const provider = new ethers.providers.WebSocketProvider(envReader.RpcUrl);
    const addresses = JSON.parse(envReader.WalletAddress);
    const wallets: ethers.Wallet[] = JSON.parse(envReader.PrivateKey).map((privateKey: string) => new ethers.Wallet(privateKey, provider));
    console.log(`🧬  Imported wallets length: ${wallets.length}.`)
    console.log(`Initialized provider with RPC Url - ${envReader.RpcUrl}`);
    const networkInfo = await provider._detectNetwork;
    console.log(`📶 Detecred Network: ${networkInfo.name} with Chain ID: ${networkInfo.chainId}`);

    const tokenDistributor = new ethers.Contract(envReader.TokenDistributorAddress, TokenDistributorAbi);
    const arbitrumToken = new ethers.Contract(envReader.ArbitrumTokenAddress, ERC20Abi);

    const Addresses: AddressType[] = []
    await Promise.all(wallets.map(async (wallet) => {
      const claimAmount = await tokenDistributor.connect(wallet).claimableTokens(wallet.address);
      Addresses.push({ receiver: envReader.ArbitrumReceiverAddress, wallet, claimAmount: claimAmount })
      console.log(`Address ${wallet.address} Will receive ${ethers.utils.formatEther(claimAmount)} $ARB Tokens`)
    }))

    await waitAndClaim(tokenDistributor, arbitrumToken, Addresses);

  } catch (err) {
    console.log(`❗Something went wrong while submitting your transaction:, ${err}`);
  }
})()