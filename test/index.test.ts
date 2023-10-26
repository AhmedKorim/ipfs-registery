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

    it("Fetch cids form chain", async () => {
      const cids =
        await web3Context.ipfsRegistry.getCIDsOfAddress("test-param");
      console.debug(cids);
    });
  });
});
