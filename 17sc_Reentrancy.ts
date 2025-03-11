import hre from 'hardhat'
const ethers = hre.ethers

async function main() {
  const [bidder1, bidder2, hacker] = await ethers.getSigners();

  const ReentrancyAuction = await ethers.getContractFactory("ReentrancyAuction", bidder1);
  const auction = await ReentrancyAuction.deploy();
  await auction.waitForDeployment();
  const auctionAddr = await auction.getAddress();

  const ReentrancyAttack = await ethers.getContractFactory("ReentrancyAttack", hacker);
  const attack = await ReentrancyAttack.deploy(auctionAddr);
  await attack.waitForDeployment();
  const attackerAddr = await attack.getAddress();

  const txBid = await auction.bid({value: ethers.parseEther("4.0")});
  await txBid.wait();

  const txBid2 = await auction.connect(bidder2).
    bid({value: ethers.parseEther("8.0")});
  await txBid2.wait();

  const txBid3 = await attack.connect(hacker).
    proxyBid({value: ethers.parseEther("1.0")});
  await txBid3.wait();

  console.log("Auction balance after bids:", (await ethers.provider.getBalance(auctionAddr)).toString());
  console.log("Attacker balance after bids:", (await ethers.provider.getBalance(attackerAddr)).toString());
  console.log("Bidder2 balance after bids:", (await ethers.provider.getBalance(bidder2.address)).toString());

  console.log("Starting attack...");

  const doAttack = await attack.connect(hacker).attack();
  await doAttack.wait();

  console.log("Auction balance", (await ethers.provider.getBalance(auctionAddr)).toString());
  console.log("Attacker balance", (await ethers.provider.getBalance(attackerAddr)).toString());
  console.log("Bidder2 balance", (await ethers.provider.getBalance(bidder2.address)).toString());    // для подписантов адрес доступен через 
                                                                                                     // .address, а для контрактов адрес нужно 
                                                                                                     // получать через .getAddress()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })