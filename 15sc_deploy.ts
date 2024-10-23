import hre from 'hardhat';
const ethers = hre.ethers

async function main() {
  const [signer] = await ethers.getSigners();
  const Erc = await ethers.getContractFactory('GRShop', signer);
  const erc = await Erc.deploy();
  await erc.waitForDeployment();

  const contractAddr1 = await erc.getAddress();
  console.log('Shop Contract Address:', contractAddr1);

  const tokenAddress = await erc.token();
  console.log('Token Contract Address:', tokenAddress);

  const token = await ethers.getContractAt("GRToken", tokenAddress);
  const shopBalance = await token.balanceOf(contractAddr1);
  console.log('Shop Token Balance:', ethers.formatUnits(shopBalance, 18));

  const shopEtherBalance = await ethers.provider.getBalance(contractAddr1);
  console.log('Shop ETH Balance:', ethers.formatEther(shopEtherBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });