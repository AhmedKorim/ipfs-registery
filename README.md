# Web3.js IPFS Registry Plugin

The Web3.js IPFS Registry Plugin is a plugin designed for web3.js version 4. It allows you to upload data to IPFS and register the Content Identifier (CID) on a smart contract. Additionally, you can query the registered CIDs from events.

## Usage

```typescript
import { IpfsRegistry, IpfsRegistryConfig } from "../lib";
import { createHelia } from "helia";
import { core } from "web3";

async function main() {
  // Create a web3 context
  const web3Context = new core.Web3Context("http://127.0.0.1:7545");
  // Create a Helia node for IPFS interaction
  const helia = await createHelia();

  const config: IpfsRegistryConfig = {
    registryContractDeployedAt: BigInt(1),
    registryContractAddress: "0xAF83b94D6771a6F9465eBA4F188c239829c60a8c",
    heliaNode: helia
  };
  // Register the Web3.js plugin
  web3Context.registerPlugin(new IpfsRegistry(config));
  
  const dataToUpload = Uint8Array.from([1, 2, 3, 4]);
  web3Context.ipfsRegistry.uploadAndRegister(dataToUpload);

  const account = "0x...."; // replace with a valid account address
  const registryResponse = await web3Context.ipfsRegistry.uploadAndRegister(fileData, {
    from: account,
    gas: "1000000",
    gasPrice: "10000000000"
  });

  console.log("Transaction hash: ", registryResponse.transactionHash);
  console.log("CID: ", registryResponse.uploadedCID);

  // Query the CIDs
  const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(account);
  console.log(cids);
}
```

## Testing

- Integration tests (Node):
  - To run the tests, add a `.env` file with a private key that has sufficient ETH balance on Sepolia and a working rpc endpoint.
  - The tests run on both the local Ganache network and the Sepolia testnet.
  - Run tests using `yarn test`.

Example `.env` file:
```
ACCOUNT_PRIVATE_KEY=310066aaedd.................................f0a13f
SEPOLIA_RPC=https://sepolia.infura.io/v3/x7s

```

- End-to-End (E2E) tests on Chrome using Cypress (Note: these tests only work on the `e2e-test` branch):
  - Similarly, add a `.env` file containing the private key.
  - Run `yarn test:e2e:chrome`.

## Known Issues

- The IPFS packages `helia` and `js-ipfs` use ECMAScript Modules (ESM). While this is fine for building the package, tests using Cypress do not work (please check the `e2e-test` branch).
- On the `master` branch, both integration and E2E tests are working, as the method for IPFS upload is just a placeholder.

## Resources

- Ethereum Faucet: [Sepolia Faucet](https://sepoliafaucet.com/)
- Web3.js Plugin Template: [GitHub Repo](https://github.com/web3/web3.js-plugin-template)
- The idea of using Cypress with Jest for running tests in a browser environment: [Web3.js Chainlink Plugin](https://github.com/ChainSafe/web3.js-plugin-chainlink)

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).