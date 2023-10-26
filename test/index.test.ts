import Web3, { core } from "web3";
import { IpfsRegistry, IpfsRegistryConfig } from "../src";

const GANACHE_CONFIG: IpfsRegistryConfig = {
  registryContractDeployedAt: BigInt(1),
  registryContractAddress: "0xF1940dA7d5a679F3aB2204572D13DaF1fA0FA7ad",
};
describe("IpfsRegistry Tests", () => {
  it("should register TokensPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:7545");

    web3Context.registerPlugin(new IpfsRegistry(GANACHE_CONFIG));
    expect(web3Context.ipfsRegistry).toBeDefined();
    expect(web3Context.ipfsRegistry.uploadFileAndRegister).toBeDefined();
    expect(web3Context.ipfsRegistry.getCIDsOfAddress).toBeDefined();
  });

  describe("IpfsRegistry method tests", () => {
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    let web3Context: Web3;

    beforeAll(() => {
      web3Context = new Web3("http://127.0.0.1:7545");
      web3Context.registerPlugin(new IpfsRegistry(GANACHE_CONFIG));
      consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });
    it("It should upload to ipfs and update the cid", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const accounts = await web3Context.eth.getAccounts();
      const defaultAccount = accounts[0];
      const registryResponse =
        await web3Context.ipfsRegistry.uploadFileAndRegister(fileData, {
          from: defaultAccount,
          gas: "1000000",
          gasPrice: "10000000000",
        });
      // ensure the CID is inserted
      const cids =
        await web3Context.ipfsRegistry.getCIDsOfAddress("test-param");
      const maybeSentCid = cids.findIndex(
        (cid) => cid === registryResponse.uploadedCID,
      );
      console.debug(
        `list of cids ,${JSON.stringify(cids, null, 2)} /n uploaded cid ${
          registryResponse.uploadedCID
        }`,
      );
      expect(maybeSentCid).toBeGreaterThan(-1);
    });
    it.only("Fetch cids form chain", async () => {
      const cids =
        await web3Context.ipfsRegistry.getCIDsOfAddress("test-param");
      console.debug(cids);
    });
  });
});
