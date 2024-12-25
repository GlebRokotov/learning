import hre from 'hardhat';
const ethers = hre.ethers

async function main() {
  console.log("DEPLOYING...");
  const [ deployer, owner ] = await ethers.getSigners();
  const MusicShop = await ethers.getContractFactory("MusicShop", deployer);
  const shop = await MusicShop.deploy(owner.address);
  await shop.waitForDeployment();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });