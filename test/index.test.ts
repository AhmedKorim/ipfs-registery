import Web3, { core } from "web3";
import { IpfsRegistry } from "../src";

describe("IpfsRegistry Tests", () => {
  it("should register TokensPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:7545");
    web3Context.registerPlugin(new IpfsRegistry());
    expect(web3Context.ipfsRegistry).toBeDefined();
  });

  describe("IpfsRegistry method tests", () => {
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    let web3Context: Web3;

    beforeAll(() => {
      web3Context = new Web3("http://127.0.0.1:8545");
      web3Context.registerPlugin(new IpfsRegistry());
      consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it("should call TempltyPlugin test method with expected param", () => {
      web3Context.ipfsRegistry.test("test-param");
      expect(consoleSpy).toHaveBeenCalledWith("test-param");
    });
  });
});
