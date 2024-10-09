import { AddressLike } from 'ethers';
import hre from 'hardhat';
import GreeterArtifact from '../artifacts/contracts/14sc_rinkeby.sol/Greeter.json';

const ethers = hre.ethers;

async function main() {
    const [signer] = await ethers.getSigners();
    const greeterAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    const greeterContrant = new ethers.Contract(
        greeterAddr,
        GreeterArtifact.abi,
        signer
    )

    const setGreetResult = await greeterContrant.setGreet("Hello from GR!");
    console.log(setGreetResult);
    await setGreetResult.wait();

    const result = await greeterContrant.getGreet();
    console.log(result);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    
    