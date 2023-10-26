import Web3, { core } from "web3";
import ganache, { EthereumProvider } from "ganache";
import { IpfsRegistry, IpfsRegistryConfig } from "../../src";
import { deployRegistryContract } from "../test.utils";
import { Web3Account } from "web3-eth-accounts";
import { createHelia, Helia } from "helia";

describe("IpfsRegistry Tests", () => {
  it("should register TokensPlugin plugin on Web3Context instance", async () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:7545");
    const heliaNode = await createHelia();
    const config: IpfsRegistryConfig = {
      registryContractDeployedAt: BigInt(1),
      registryContractAddress: "0xAF83b94D6771a6F9465eBA4F188c239829c60a8c",
      heliaNode,
    };
    web3Context.registerPlugin(new IpfsRegistry(config));
    expect(web3Context.ipfsRegistry).toBeDefined();
    await heliaNode.stop()
  });

  describe("IpfsRegistry methods tests with local testnet", () => {
    let web3Context: Web3;
    let ganacheProvider: EthereumProvider;
    let heliaNode: Helia;

    beforeAll(async () => {
       heliaNode = await createHelia();

      ganacheProvider = ganache.provider({
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
        heliaNode
      };

      web3Context.registerPlugin(new IpfsRegistry(config));
    });

    afterAll(async () => {
      await ganacheProvider.disconnect();
      await heliaNode.stop();
    });

    it("should upload to ipfs and update the cid", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const cid = await web3Context.ipfsRegistry.uploadFileToIpfs(fileData);

      const accounts = await web3Context.eth.getAccounts();
      const defaultAccount = accounts[0];

      const registryResponse = await web3Context.ipfsRegistry.registerCid(cid, {
        from: defaultAccount,
        gas: "1000000",
        gasPrice: "10000000000",
      });

      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(defaultAccount);
      const maybeSentCid = cids.findIndex((cid) => cid === registryResponse.uploadedCID);

      expect(registryResponse.uploadedCID).toMatch(cid);
      expect(maybeSentCid).toBeGreaterThan(-1);
    });

    it("should Fetch cids form chain", async () => {
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress("0x131539bCD84A18a879f68Cf1BA3f684AE050098c");
      expect(cids.length).toBeDefined();
    });

    it("should Fetch cids should fail with invalid address", async () => {
      const getCids = (): Promise<string[]> => {
        return web3Context.ipfsRegistry.getCIDsOfAddress("0x302932C3b8ee6f88cfd35b867C3d6AfCada5d548");
      };
      await expect(getCids()).rejects.toThrow("Invalid address");
    });
  });

  describe("IpfsRegistryPlugin method tests with Sepolia testnet", () => {
    let web3Context: Web3;
    let account: Web3Account;
    let heliaNode: Helia;

    beforeAll(async () => {
      heliaNode = await createHelia();
      web3Context = new Web3("https://sepolia.infura.io/v3/62a6727b83c34df2b4d203d61fd1be22");
      const privateKey = "0x" + process.env.ACCOUNT_PRIVATE_KEY!;
      account = web3Context.eth.accounts.privateKeyToAccount(privateKey);
      web3Context.eth.accounts.wallet.add(account);
      const config: IpfsRegistryConfig = {
        registryContractDeployedAt: BigInt(4562201),
        registryContractAddress: "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB",
        heliaNode
      };

      web3Context.registerPlugin(new IpfsRegistry(config));
    });

    afterAll(async ()=>{
      await heliaNode.stop()
    })

    it("should upload file data to ipfs and query the contract for cids of this user", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const cid = await web3Context.ipfsRegistry.uploadFileToIpfs(fileData);
      const registryUser = account.address;
      const registryResponse = await web3Context.ipfsRegistry.registerCid(cid, {
        from: registryUser,
        gas: "1000000",
        gasPrice: "10000000000",
      });

      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(registryUser);
      const maybeSentCid = cids.findIndex((cid) => cid === registryResponse.uploadedCID);

      expect(registryResponse.uploadedCID).toMatch(cid);
      expect(maybeSentCid).toBeGreaterThan(-1);
    },100_000);

    it("should fetch CIDs from sepolia testnet", async () => {
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress("0xe213213cd90f95d3251bebe5a10a3fc484d207cd");
      expect(cids.length).toBeGreaterThan(0);
    },100_000);
  });
});
