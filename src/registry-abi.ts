/**
 * Abi for the registry contract
 * */
export const RegistryAbi = [
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

/**
 * Base type of the of the registry contract
 * */
export type RegistryAbiInterface = typeof ABI;
