import { AddressType } from './Address.type';
import { ethers } from "ethers";
import { envReader } from "./envReader";

const claimTokens = async (tokenDistributor: ethers.Contract, addresses: AddressType[], provider: ethers.providers.WebSocketProvider) => {
  const { gasPrice } = await provider.getFeeData();
  await Promise.all(addresses.map(async ({ wallet }) => {
    try {
      const tx = await tokenDistributor.connect(wallet).claim({
        gasPrice,
        gasLimit: '0xe4e1c0',
      });
      await tx.wait();
      console.log(`✅ Tokens claimed, address: ${wallet.address}`);
    } catch (err) {
      console.log(`❌ Error claim() tokens, address: ${wallet.address}, ${err}`);
    }
  }))
}

const sendToReceiver = async (arbitrumToken: ethers.Contract, addresses: AddressType[], provider: ethers.providers.WebSocketProvider) => {
  const { gasPrice } = await provider.getFeeData();
  await Promise.all(addresses.map(async ({ wallet, receiver }) => {
    try {
      const balance = await arbitrumToken.connect(wallet).balanceOf(wallet.address);
      console.log(`💰 Your balance is: ${ethers.utils.formatEther(balance)} $ARB, Address: ${wallet.address}`);

      const tx = await arbitrumToken.connect(wallet).transfer(receiver, balance, {
        gasPrice,
        gasLimit: '0xe4e1c0',
      });
      console.log(`🎉 The hash of your transaction is: https://arbiscan.io/tx/${tx.hash}, Address: ${wallet.address}`);
      await tx.wait();
      console.log(`🚀 Address: ${wallet.address}, transation confirmed!`)
    } catch (err) {
      console.log(`❌ Error send transaction to receiver: ${wallet.address}, ${err}`);
    }
  }))
}

export const waitAndClaim = async (tokenDistributor: ethers.Contract, arbitrumToken: ethers.Contract, addresses: AddressType[], provider: ethers.providers.WebSocketProvider) => {
  console.log('Waitinig for transactions...');
  
  tokenDistributor
    .connect(addresses[0].wallet)
    .once('HasClaimed', async () => {
      console.log(`🚀 Claim started, start claiming tokens`);
      await claimTokens(tokenDistributor, addresses, provider);
      await sendToReceiver(arbitrumToken, addresses, provider);

      console.log('🏁 Finished!');
    });
};