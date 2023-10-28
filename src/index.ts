import crypto from "crypto";
import {
  Address,
  Contract,
  DEFAULT_RETURN_FORMAT,
  eth,
  PayableCallOptions,
  TransactionReceipt,
  Web3Context,
  Web3PluginBase,
  validator,
} from "web3";

import { EventLog } from "web3-eth-contract";
import { DEPLOYED_AT, registryAbi, RegistryAbiInterface } from "./registry-abi";

export type IpfsRegistryConfig = {
  // The abi for the registry contract
  registryContractAbi?: RegistryAbiInterface;
  // Blocknumber when the contract was created
  registryContractDeployedAt?: bigint;
  // Registry contract address
  registryContractAddress?: Address;
};

export type IpfsRegistryResponse = {
  transactionHash: string;
  uploadedCID: string;
};

export class IpfsRegistry extends Web3PluginBase {
  public pluginNamespace = "ipfsRegistry";
  private readonly _registryContract: Contract<RegistryAbiInterface>;
  private readonly _registryContractDeployedAt: bigint;

  constructor(config: IpfsRegistryConfig) {
    super();

    this._registryContractDeployedAt = config.registryContractDeployedAt || DEPLOYED_AT;
    const contractAbi = config.registryContractAbi || registryAbi;
    const contractAddress: Address = config.registryContractAddress || "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";

    // Instantiate the registry contract
    this._registryContract = new Contract<RegistryAbiInterface>(contractAbi, contractAddress);
    // Linking web3 context the registry contract
    this._registryContract.link(this);
  }

  /**
   * Upload a blob to ipfs and return the CID for it
   * @param _fileData - Represents the bytes for the file to upload
   * */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async uploadFileToIpfs(_fileData: Uint8Array): Promise<string> {
    const cid = crypto.randomBytes(33).toString();
    return Promise.resolve(cid);
  }

  /**
   * Upload file to ipfs and submit the CID to the registry contract
   * @param fileData - Represents the bytes for the file to upload
   * @param txOptions - Payable options that's used for configuring the transaction
   * */
  public async uploadAndRegister(fileData: Uint8Array, txOptions: PayableCallOptions): Promise<IpfsRegistryResponse> {
    const fileCid = await this.uploadFileToIpfs(fileData);
    const txReceipt: TransactionReceipt = await this._registryContract.methods.store(fileCid).send(txOptions);
    return {
      transactionHash: txReceipt.transactionHash.toString(),
      uploadedCID: fileCid,
    };
  }

  link(parentContext: Web3Context): void {
    super.link(parentContext);
    this._registryContract.link(parentContext);
  }

  /**
   *
   * Fetch the added CID for an address
   * It loads filtered list of events emitted by the contract in chunks
   * Combine all chunks in one list
   * */
  public async getCIDsOfAddress(address: string): Promise<string[]> {
    // Check for address validly
    if (!validator.isAddress(address)) {
      throw new Error("Invalid address");
    }
    // The full list of cids stored in the contract
    const cids: string[] = [];
    const events: EventLog[] = [];

    // get the latest block from the chain
    const lastBlockNumber = await eth.getBlockNumber(this, DEFAULT_RETURN_FORMAT);

    for (
      let currentBlock = this._registryContractDeployedAt;
      currentBlock <= lastBlockNumber;
      // 1024 as this is maximum entries per query
      currentBlock += BigInt(1024)
    ) {
      const fetchedEvents = await this._registryContract.getPastEvents("CIDStored", {
        fromBlock: currentBlock,
        toBlock: currentBlock + BigInt(1024),
        filter: {
          owner: address.toLocaleLowerCase(),
        },
      });

      events.push(...(fetchedEvents as EventLog[]));

      // Looping over the events as the event parameter `cid` entry is an index parameter not the
      // actual CID value submitted to the store call
      for (const event of fetchedEvents) {
        if (typeof event === "string" || event.transactionHash === undefined) {
          continue;
        }
        const transactionHash = event.transactionHash;
        const transaction = await eth.getTransaction(this, transactionHash, DEFAULT_RETURN_FORMAT);
        if (!transaction) {
          continue;
        }
        // Decoding the transaction parameters from the input
        const txInput = eth.abi.decodeParameters(
          [{ internalType: "string", name: "cid", type: "string" }],
          transaction.input.slice(10)
        );
        const cid = txInput.cid as string;
        cids.push(cid);
      }
    }
    // Log all the CIDStored events
    console.log("CIDStored events", events);

    return cids;
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfsRegistry: IpfsRegistry;
  }
}
