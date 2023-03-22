import { AddressType } from './Address.type';
import { ethers } from "ethers";
import { envReader } from "./envReader";

const claimTokens = async (tokenDistributor: ethers.Contract, addresses: AddressType[]) => {
  await Promise.all(addresses.map(async ({ wallet }) => {
    try {
      const tx = await tokenDistributor.connect(wallet).claim();
      await tx.wait();
      console.log(`✅ Tokens claimed, address: ${wallet.address}`);
    } catch (err) {
      console.log(`❌ Error claim() tokens, address: ${wallet.address}, ${err}`);
    }
  }))
}

const sendToReceiver = async (arbitrumToken: ethers.Contract, addresses: AddressType[]) => {
  await Promise.all(addresses.map(async ({ wallet, receiver }) => {
    try {
      const balance = await arbitrumToken.connect(wallet).balanceOf(wallet.address);
      console.log(`💰 Your balance is: ${ethers.utils.formatEther(balance)} $ARB, Address: ${wallet.address}`);

      const tx = await arbitrumToken.connect(wallet).transfer(receiver, balance);
      console.log(`🎉 The hash of your transaction is: https://goerli.arbiscan.io/tx/${tx.hash}, Address: ${wallet.address}`);
      await tx.wait();
      console.log(`🚀 Address: ${wallet.address}, transation confirmed!`)
    } catch (err) {
      console.log(`❌ Error send transaction to receiver: ${wallet.address}, ${err}`);
    }
  }))
  
}

export const waitAndClaim = async (tokenDistributor: ethers.Contract, arbitrumToken: ethers.Contract, addresses: AddressType[]) => {
  console.log('Waitinig for transactions...');
  
  tokenDistributor
    .connect(addresses[0].wallet)
    .once('HasClaimed', async () => {
      console.log(`🚀 Claim started, start claiming tokens`);
      await claimTokens(tokenDistributor, addresses);
      await sendToReceiver(arbitrumToken, addresses)

      console.log('🏁 Finished!');
    });
};