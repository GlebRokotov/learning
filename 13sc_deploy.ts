import hre from 'hardhat';
const ethers = hre.ethers;

async function main() {
    const [signer] = await ethers.getSigners();

    const Transfers = await ethers.getContractFactory('Transfers', signer);
    const transfers = await Transfers.deploy(3);
    await transfers.waitForDeployment();
    const contractAddr1 = await transfers.getAddress();
    console.log(contractAddr1);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
