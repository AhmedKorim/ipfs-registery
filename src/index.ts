import crypto from "crypto";
import {
  Contract,
  DEFAULT_RETURN_FORMAT,
  eth,
  Web3PluginBase,
  Address,
} from "web3";
import { DEPLOYED_AT, registryAbi, RegistryAbiInterface } from "./registry-abi";

export type IpfsRegistryConfig = {
  registryContractAbi?: RegistryAbiInterface;
  registryContractDeployedAt?: bigint;
  registryContractAddress?: Address;
};
export class IpfsRegistry extends Web3PluginBase {
  public pluginNamespace = "ipfsRegistry";
  private readonly _registryContract: Contract<RegistryAbiInterface>;
  private readonly _registryContractDeployedAt: bigint;

  constructor(config: IpfsRegistryConfig = {}) {
    super();

    this._registryContractDeployedAt =
      config.registryContractDeployedAt || DEPLOYED_AT;
    const contractAbi = config.registryContractAbi || registryAbi;
    const contractAddress: Address =
      config.registryContractAddress ||
      "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";
    // Instantiate the registry contract
    this._registryContract = new Contract<RegistryAbiInterface>(
      contractAbi,
      contractAddress,
    );
    // Linking web3 context the registry contract
    this._registryContract.link(this);
  }

  /**
   * Upload a blob to ipfs and return the CID for it
   * @param{_fileData} - Represents the bytes for the file to upload
   * */
  private async uploadFileToIpfs(_fileData: Uint8Array): Promise<string> {
    // Random CID
    const cid = await new Promise<string>((r) =>
      r(crypto.randomBytes(32).toString("hex")),
    );
    return cid;
  }

  /**
   * Upload file to ipfs and submit the CID to the registry contract
   *
   * */
  public async uploadFileAndRegister(fileData: Uint8Array): Promise<void> {
    // Upload the file to IPFS
    const fileCid = await this.uploadFileToIpfs(fileData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this._registryContract.methods.store(fileCid).send({
      gas: "1000000",
      gasPrice: "10000000000",
    });
  }

  /**
   * Fetch the added CID for an address
   * It loads filtered list of events emitted by the contract in chunks
   * Combine all chunks in one list
   * */
  public async getCIDsOfAddress(_address: string): Promise<string[]> {
    // The full list of cids stored in the contract
    const Cids: string[] = [];

    // get the latest block from the chain
    const lastBlockNumber = await eth.getBlockNumber(
      this,
      DEFAULT_RETURN_FORMAT,
    );

    for (
      let currentBlock = this._registryContractDeployedAt;
      currentBlock <= lastBlockNumber;
      // 1024 as this is maximum entries per query
      currentBlock += BigInt(1024)
    ) {
      const fetchedEvent = await this._registryContract.getPastEvents(
        "CIDStored",
        {
          fromBlock: currentBlock,
          toBlock: currentBlock + BigInt(1024),
        },
      );

      Cids.push(
        ...fetchedEvent
          .filter((event) => typeof event != "string")
          .map((event) => {
            if (typeof event === "string") {
              throw new Error("Filed to map events");
            }
            const cid = event.returnValues.cid as string;
            return cid;
          }),
      );
    }
    return Cids;
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfsRegistry: IpfsRegistry;
  }
}
