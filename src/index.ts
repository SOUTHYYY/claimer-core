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
    const rpcs = JSON.parse(envReader.RpcUrl);
    const mainProvider = new ethers.providers.WebSocketProvider(rpcs[0]);
    console.log(`Initialized provider with RPC Url - ${rpcs[0]}`);
    const networkInfo = await mainProvider._detectNetwork;
    console.log(`📶 Detecred Network: ${networkInfo.name} with Chain ID: ${networkInfo.chainId}`);

    const receivers = JSON.parse(envReader.ArbitrumReceiverAddress);

    const wallets: ethers.Wallet[] = JSON.parse(envReader.PrivateKey).map((privateKey: string, idx: number) => {
      const provider = new ethers.providers.WebSocketProvider(rpcs[idx]);
      return new ethers.Wallet(privateKey, provider);
    });

    console.log(`🧬 Imported wallets: ${wallets.length}.`);

    const tokenDistributor = new ethers.Contract(envReader.TokenDistributorAddress, TokenDistributorAbi);
    const arbitrumToken = new ethers.Contract(envReader.ArbitrumTokenAddress, ERC20Abi);

    const Addresses: AddressType[] = [];
    await Promise.all(wallets.map(async (wallet, idx) => {
      const claimAmount = await tokenDistributor.connect(wallet).claimableTokens(wallet.address);
      Addresses.push({ receiver: receivers[idx], wallet, claimAmount: claimAmount });
      console.log(`Address ${wallet.address} Will receive ${ethers.utils.formatEther(claimAmount)} $ARB Tokens`);
    }));

    await waitAndClaim(tokenDistributor, arbitrumToken, Addresses, mainProvider);

  } catch (err) {
    console.log(`❗Something went wrong while submitting your transaction:, ${err}`);
  }
})()