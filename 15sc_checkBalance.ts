import { ethers } from 'hardhat';

async function main() {
  const shopAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const tokenAddress: string = '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be';

  const [signer] = await ethers.getSigners();                                                          //получаем текущего пользователя

  const shop = await ethers.getContractAt("GRShop", shopAddress, signer);                              // получаем экземпляр контракта GRShop
  
  const token = await ethers.getContractAt("GRToken", tokenAddress, signer);                           // получаем экземпляр контракта 
                                                                                                       // токена GRToken

  const shopEtherBalance = await ethers.provider.getBalance(shopAddress);
  console.log("Current Shop ETH Balance:", ethers.formatEther(shopEtherBalance));                      // получаем текущий баланс эфиров на 
                                                                                                       // адресе магазина

  const shopTokenBalance = await token.balanceOf(shopAddress);
  console.log("Current Shop Token Balance:", ethers.formatUnits(shopTokenBalance, 18));                // получаем текущий баланс токенов
                                                                                                       // на адресе магазина
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
