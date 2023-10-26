/**Global Cypress*/

import Web3, { Web3Context } from "web3";
import { IpfsRegistry, IpfsRegistryConfig } from "../../src";
import { Web3Account } from "web3-eth-accounts";
import { createHelia, Helia } from "helia";

describe("IpfsRegistry Tests", () => {
  it("should register IpfsRegistry plugin on Web3Context instance", async () => {
    const web3Context = new Web3Context("https://rpc.notadegen.com/https://api.zan.top/node/v1/eth/sepolia/public");
    const heliaNode = await createHelia();
    web3Context.registerPlugin(
      new IpfsRegistry({
        registryContractAddress: "0xa683bf985bc560c5dc99e8f33f3340d1e53736eb",
        registryContractDeployedAt: BigInt(4546394),
        heliaNode
      })
    );
    expect(web3Context.ipfsRegistry).toBeDefined();
    await heliaNode.stop();
  });

  describe("IpfsRegistryPlugin method tests", () => {
    let web3Context: Web3;
    let account: Web3Account;
    let heliaNode: Helia;

    beforeAll(async () => {
      web3Context = new Web3("https://sepolia.infura.io/v3/62a6727b83c34df2b4d203d61fd1be22");
      heliaNode = await createHelia();


      // @ts-ignore
      const privateKey = "0x" + Cypress.env("ACCOUNT_PRIVATE_KEY");
      account = web3Context.eth.accounts.privateKeyToAccount(privateKey);
      web3Context.eth.accounts.wallet.add(account);
      const config: IpfsRegistryConfig = {
        registryContractDeployedAt: BigInt(4562201),
        registryContractAddress: "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB",
        heliaNode
      };

      web3Context.registerPlugin(new IpfsRegistry(config));
    });
    afterAll(async () => {
      await heliaNode.stop();
    });

    it("should upload file data to ipfs and query the contract for cids of this user", async () => {
      const fileData = Uint8Array.from([1, 1, 1, 1]);
      const cid = await web3Context.ipfsRegistry.uploadFileToIpfs(fileData);
      const registryUser = account.address;

      const registryResponse = await web3Context.ipfsRegistry.registerCid(cid, {
        from: registryUser,
        gas: "1000000",
        gasPrice: "10000000000"
      });

      // ensure the CID is inserted
      const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(registryUser);
      const maybeSentCid = cids.findIndex((cid) => cid === registryResponse.uploadedCID);

      expect(registryResponse.uploadedCID).toMatch(cid);
      expect(maybeSentCid).toBeGreaterThan(-1);
    });

    it("should fetch CIDs from sepolia testnet", async () => {
      const cid = await web3Context.ipfsRegistry.getCIDsOfAddress("0xe213213cd90f95d3251bebe5a10a3fc484d207cd");
      expect(cid).toBeDefined();
    });
  });
});
