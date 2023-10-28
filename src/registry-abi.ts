/**
 * Abi for the registry contract
 * */
export const registryAbi = [
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
// The block number when this contract was uploaded
export const DEPLOYED_AT = BigInt(4546394);

/**
 * Base type of the of the registry contract
 * */
export type RegistryAbiInterface = typeof registryAbi;
