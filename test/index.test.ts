import Web3, { core } from "web3";
import { createHelia, Helia } from "helia";
import { IpfsRegistry, IpfsRegistryConfig } from "../src";

const GANACHE_BASE_CONFIG: Omit<IpfsRegistryConfig, "heliaNode"> = {
  registryContractDeployedAt: BigInt(1),
  registryContractAddress: "0xAF83b94D6771a6F9465eBA4F188c239829c60a8c",
};
describe("IpfsRegistry Tests", () => {
  it("should register TokensPlugin plugin on Web3Context instance", async () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:7545");
    const heliaNode = await createHelia();
    const config: IpfsRegistryConfig = {
      ...GANACHE_BASE_CONFIG,
      heliaNode,
    };
    web3Context.registerPlugin(new IpfsRegistry(config));
    expect(web3Context.ipfsRegistry).toBeDefined();
    // Stop the IPFS node
    await heliaNode.stop();
  });

  describe("IpfsRegistry methods tests", () => {
    let web3Context: Web3;
    let heliaNode: Helia;

    beforeAll(async () => {
      web3Context = new Web3("http://127.0.0.1:7545");
      heliaNode = await createHelia();
      const config: IpfsRegistryConfig = {
        ...GANACHE_BASE_CONFIG,
        heliaNode,
      };
      web3Context.registerPlugin(new IpfsRegistry(config));
      web3Context.ipfsRegistry.requestManager
    });

    afterAll(async () => {
      await heliaNode.stop();
    });

    it("should upload to ipfs and update the cid", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const accounts = await web3Context.eth.getAccounts();
      const defaultAccount = accounts[0];
      const cid = await web3Context.ipfsRegistry.uploadFileToIpfs(fileData);
      const registryResponse = await web3Context.ipfsRegistry.registerCid(cid, {
        from: defaultAccount,
        gas: "1000000",
        gasPrice: "10000000000",
      });
      expect(registryResponse.uploadedCID).toMatch(cid);
      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(
        defaultAccount
      );
      const maybeSentCid = cids.findIndex(
        (cid) => cid === registryResponse.uploadedCID
      );

      expect(maybeSentCid).toBeGreaterThan(-1);
    });

    it("should Fetch cids form chain", async () => {
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(
        "0x131539bCD84A18a879f68Cf1BA3f684AE050098c"
      );
      expect(cids.length).toBeDefined();
    });

    it("should Fetch cids should fail with invalid address", async () => {
      const getCids = (): Promise<string[]> => {
        return web3Context.ipfsRegistry.getCIDsOfAddress(
          "0x302932C3b8ee6f88cfd35b867C3d6AfCada5d548"
        );
      };
      await expect(getCids()).rejects.toThrow("Invalid address");
    });
  });
});
