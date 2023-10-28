import Web3, { core } from "web3";
import ganache, { EthereumProvider } from "ganache";
import { Web3Account } from "web3-eth-accounts";
import { createHelia, Helia } from "helia";
import { IpfsRegistry, IpfsRegistryConfig } from "../../src";
import { deployRegistryContract } from "../test.utils";

describe("IpfsRegistry Tests", () => {
  it("should register TokensPlugin plugin on Web3Context instance", async () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:7545");
    const helia = await createHelia();
    const config: IpfsRegistryConfig = {
      registryContractDeployedAt: BigInt(1),
      registryContractAddress: "0xAF83b94D6771a6F9465eBA4F188c239829c60a8c",
      heliaNode: helia,
    };
    web3Context.registerPlugin(new IpfsRegistry(config));
    expect(web3Context.ipfsRegistry).toBeDefined();
    await helia.stop();
  });

  describe("IpfsRegistryPlugin methods tests with local testnet", () => {
    let web3Context: Web3;
    let ganacheProvider: EthereumProvider;
    let helia: Helia;

    beforeAll(async () => {
      helia = await createHelia();
      ganacheProvider = ganache.provider({
        wallet: {
          deterministic: true,
        },
        logging: {
          quiet: true,
        },
      });
      await ganacheProvider.initialize();
      web3Context = new Web3(ganacheProvider);
      const accounts = await web3Context.eth.getAccounts();
      const defaultAccount = accounts[0];

      const registryContractAddress = await deployRegistryContract(web3Context, defaultAccount);
      const config: IpfsRegistryConfig = {
        registryContractDeployedAt: BigInt(1),
        registryContractAddress,
        heliaNode: helia,
      };

      web3Context.registerPlugin(new IpfsRegistry(config));
    });

    afterAll(async () => {
      await ganacheProvider.disconnect();
      await helia.stop();
    });

    it("should upload to ipfs and update the CID", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);

      const accounts = await web3Context.eth.getAccounts();
      const defaultAccount = accounts[0];

      const registryResponse = await web3Context.ipfsRegistry.uploadAndRegister(fileData, {
        from: defaultAccount,
        gas: "1000000",
        gasPrice: "10000000000",
      });

      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(defaultAccount);
      const maybeSentCid = cids.findIndex((cid) => cid === registryResponse.uploadedCID);

      expect(maybeSentCid).toBeGreaterThan(-1);
    });

    it("should Fetch cids form chain", async () => {
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress("0x131539bCD84A18a879f68Cf1BA3f684AE050098c");
      expect(cids.length).toBeDefined();
    });

    it("should Fetch CIDs should fail with invalid address", async () => {
      const getCids = (): Promise<string[]> => {
        return web3Context.ipfsRegistry.getCIDsOfAddress("0x302932C3b8ee6f88cfd35b867C3d6AfCada5d548");
      };
      await expect(getCids()).rejects.toThrow("Invalid address");
    });
  });

  describe("IpfsRegistryPlugin method tests with Sepolia testnet", () => {
    let web3Context: Web3;
    let account: Web3Account;
    let helia: Helia;

    beforeAll(async () => {
      helia = await createHelia();
      const rpc = process.env.SEPOLIA_RPC!;
      web3Context = new Web3(rpc);
      const privateKey = "0x" + process.env.ACCOUNT_PRIVATE_KEY!;
      account = web3Context.eth.accounts.privateKeyToAccount(privateKey);
      web3Context.eth.accounts.wallet.add(account);
      const config: IpfsRegistryConfig = {
        registryContractDeployedAt: BigInt(4562201),
        registryContractAddress: "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB",
        heliaNode: helia,
      };

      web3Context.registerPlugin(new IpfsRegistry(config));
    });

    afterAll(async () => {
      await helia.stop();
    });

    it("should upload file data to ipfs and query the contract for CIDs of this user", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const registryUser = account.address;
      const registryResponse = await web3Context.ipfsRegistry.uploadAndRegister(fileData, {
        from: registryUser,
        gas: "1000000",
        gasPrice: "10000000000",
      });

      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(registryUser);
      const maybeSentCid = cids.findIndex((cid) => cid === registryResponse.uploadedCID);

      expect(maybeSentCid).toBeGreaterThan(-1);
    }, 900000);

    it("should fetch CIDs from sepolia testnet", async () => {
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress("0xe213213cd90f95d3251bebe5a10a3fc484d207cd");
      expect(cids.length).toBeGreaterThan(0);
    }, 30000);
  });
});
