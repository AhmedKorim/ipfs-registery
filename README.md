# Web3.js IPFS registry Plugin
Upload data on IPFS and register the CID on smart contract, then submitted CIDs by an addess can be fetched
from events






### Usage
```typescript
import { IpfsRegistry , IpfsRegistryConfig } from "../lib";
import { createHelia } from "helia";

async function main(){
  // create a web3 context
  const web3Context = new core.Web3Context("http://127.0.0.1:7545");
  // Creata helia node for IPFS interaction 
  const helia = await createHelia();
  
  const config: IpfsRegistryConfig = {
    registryContractDeployedAt: BigInt(1),
    registryContractAddress: "0xAF83b94D6771a6F9465eBA4F188c239829c60a8c",
    heliaNode:helia
  };
  // Web3.js plugin registeriation
  web3Context.registerPlugin(new IpfsRegistry(config));
  const dataToUpload = Uint8Array.from([1,2,3,,4])
  web3Context.ipfsRegistry.uploadAndRegister(dataToUpload , )
  const account = "0x...." // some account
  const registryResponse = await web3Context.ipfsRegistry.uploadAndRegister(fileData, {
    from: account,
    gas: "1000000",
    gasPrice: "10000000000",
  });
  
  console.log("Transaction hash: " , registryResponse.transactionHash);
  console.log("CID: " , registryResponse.uploadedCID);
  
  
  // Query the CIDs
  const cids = await web3Context.ipfsRegistry.getCIDsOfAddress(account);
  console.log(cids);
  
  
  
}

```
### Testing
- Integration tests (Node)
  - Added a `.env` file with a private key that has enough eth balance on Sepolia
  - Tests are running both on local ganache , and on the Sepolia testnet
  - Run tests `yarn test`
  ```.env
  ACCOUNT_PRIVATE_KEY=310066aaedd.................................f0a13f
  ```
- E2E tests on chrome using cypress ( Note those test only working on branch e2e-test)
  - Similarly add a `.env` contains the private key
  - run `yarn test:e2e:chrome`

### Known issues
- IPFS packages `helia`, and `js Ipfs`use esm, this fine for the package to build but tests using cypress aren't working (please check the e2e-test branch)
- On Master both integration and e2e tests are working as the method for IPFS upload is just a placeholder


### Resources
- Eth Faucet: [sepoliafaucet](https://sepoliafaucet.com/)
- Web3.js plugin template: [github repo](https://github.com/web3/web3.js-plugin-template)
- The idea of using cypress with jest for running tests on the browser environment [web3.js chain link plugin](https://github.com/ChainSafe/web3.js-plugin-chainlink)


Contributing
------------

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

License
-------

[MIT](https://choosealicense.com/licenses/mit/)
