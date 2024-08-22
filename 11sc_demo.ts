import { ethers } from "ethers";

import hre from "hardhat";

async function main() {
    const [signer] = (await hre.ethers.getSigners());
    const accountBalance = await signer.provider.getBalance(signer.address);
    console.log(ethers.formatEther(accountBalance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
