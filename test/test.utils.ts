import { Address, Contract, Web3Context } from "web3";

const registryContractByteCode =
  "608060405234801561001057600080fd5b506101f5806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063131a068014610030575b600080fd5b61004a6004803603810190610045919061011a565b61004c565b005b818160405161005c9291906101a6565b60405180910390203373ffffffffffffffffffffffffffffffffffffffff167fd8a0edc6ade10e42d7ab691902b8c1a635fabe45ace3609fc4fbfad7e424e42760405160405180910390a35050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126100da576100d96100b5565b5b8235905067ffffffffffffffff8111156100f7576100f66100ba565b5b602083019150836001820283011115610113576101126100bf565b5b9250929050565b60008060208385031215610131576101306100ab565b5b600083013567ffffffffffffffff81111561014f5761014e6100b0565b5b61015b858286016100c4565b92509250509250929050565b600081905092915050565b82818337600083830152505050565b600061018d8385610167565b935061019a838584610172565b82840190509392505050565b60006101b3828486610181565b9150819050939250505056fea26469706673582212209108e82f95e82b55a95ecab9a6c3ce3e13b232a9f083da0b5e212e213c47bea964736f6c63430008120033";

const registryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      { indexed: true, internalType: "string", name: "cid", type: "string" },
    ],
    name: "CIDStored",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "cid", type: "string" }],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function deployRegistryContract(web3: Web3Context, deployerAccount: Address): Promise<string> {
  const registryContract = new Contract(registryAbi, web3);
  const deployTransaction = registryContract.deploy({ data: registryContractByteCode });
  const gas = await deployTransaction.estimateGas();
  const deployedContract = await deployTransaction.send({
    from: deployerAccount,
    gas: gas.toString(),
  });
  if (!deployedContract.options.address) {
    throw new Error("Failed to deploy the contract");
  }
  return deployedContract.options.address;
}
