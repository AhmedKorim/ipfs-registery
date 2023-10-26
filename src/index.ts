import crypto from "crypto";
import { Contract, Web3PluginBase } from "web3";
import { RegistryAbi, RegistryAbiInterface } from "./registry-abi";

export class IpfsRegistry extends Web3PluginBase {
  public pluginNamespace = "ipfsRegistry";
  private readonly _registryContract: Contract<RegistryAbiInterface>;

  constructor() {
    super();
    // Instantiate the registry contract
    this._registryContract = new Contract<RegistryAbi>(
      RegistryAbi,
      "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB",
    );
    // Linking web3 context the registry contract
    this._registryContract.link(parentContext);
  }

  /**
   * Upload a blob to ipfs and return the CID for it
   * @param{_fileData} - Represents the bytes for the file to upload
   * */
  private async uploadFileToIpfs(_fileData: Uint8Array): Promise<string> {
    const cid = await new Promise((r) =>
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

  public test(param: string): void {
    console.log(param);
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfsRegistry: IpfsRegistry;
  }
}
