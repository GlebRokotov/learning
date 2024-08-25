import { AddressLike } from 'ethers';
import hre from 'hardhat';
import TransfersArtifact from '../artifacts/contracts/13sc_Transfers.sol/Transfers.json';

const ethers = hre.ethers;

async function currentBalance (address: AddressLike, msg = '') {
    const rawBalance = await ethers.provider.getBalance(address);    
    console.log(msg, ethers.formatEther(rawBalance));
}

async function main() {
    const [acc1, acc2] = await ethers.getSigners();
    const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    const transfersContrant = new ethers.Contract(
        contractAddr,
        TransfersArtifact.abi,
        acc1
    )

    /*const tx = {                                                            // блок для отправки эфира на адрес контракта
        to: contractAddr,
        value: ethers.parseEther('1')
    }
    
    const txSend = await acc2.sendTransaction(tx);
    await txSend.wait();    

    await currentBalance(acc2.address, 'Account 2 balance:');
    await currentBalance(contractAddr, 'Contract balance:');*/

    /*const result = await transfersContrant.getTransfer(0);                  // блок для выполнения запроса о конкретном переводе из контракта
    console.log(ethers.formatEther(result['amount']), result['sender']);*/

    /*const result = await transfersContrant.withdrawTo(acc2.address);        // блок выполняет вывод средств из контракта на указанный адрес
                                                                              // и проверяет обновленные балансы.
    console.log(result);
    await currentBalance(acc2.address, 'Account 2 balance:');
    await currentBalance(contractAddr, 'Contract balance:');*/

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    
    
