import { ethers } from "ethers";

export type AddressType = {
  receiver: string;
  wallet: ethers.Wallet;
  claimAmount: number;
}