import hre from 'hardhat'; 
const ethers = hre.ethers;

async function main() {
    const [signer] = await ethers.getSigners();

    const Greeter = await ethers.getContractFactory('Greeter', signer);
    const greeter = await Greeter.deploy();
    await greeter.waitForDeployment();
    const contractAddr1 = await greeter.getAddress();
    console.log(contractAddr1);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
