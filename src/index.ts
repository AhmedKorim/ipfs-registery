import { Web3PluginBase } from "web3";

export class IpfsRegistry extends Web3PluginBase {
  public pluginNamespace = "ipfsRegistry";

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
