import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";

describe("DutchAuc", function() {
    
    async function deploy() {
        const [owner, seller, buyer] = await ethers.getSigners();  
        const Factory = await ethers.getContractFactory("DutchAuc");
        const auct = await Factory.deploy();
        await auct.waitForDeployment();  
        return { owner, seller, buyer, auct }   
    }

    it("sets owner", async function() {
        const { owner, auct } = await loadFixture(deploy);
        const currentOwner = await auct.owner();
        expect(currentOwner).to.eq(owner.address);
      });
    
    async function getTimestamp(blockNumber: number): Promise<number> {
        const block = await ethers.provider.getBlock(blockNumber);
        if (!block) {
            throw new Error(`Block with number ${blockNumber} not found`);
        }
        return block.timestamp;
    }

    it("creates auction correctly", async function() {
        const { auct } = await loadFixture(deploy);
        const duration = 60
        const tx = await auct.createAuction(
          ethers.parseEther("0.0001"),
          3,
          "fake item",
          duration
        )
        await tx.wait();
        
        if (tx.blockNumber === null) {
            throw new Error("Transaction block number is null");
        }
  
        const cAuction = await auct.auctions(0)
        expect(cAuction.item).to.eq("fake item")
        const ts = await getTimestamp(tx.blockNumber)
        expect(cAuction.endsAt).to.be.closeTo(ts + duration, 5);
      });
    
    function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    
      it("allows to buy", async function () {
        const { auct, seller, buyer } = await loadFixture(deploy);
        await auct.connect(seller).createAuction(
          ethers.parseEther("0.0001"),
          3,
          "fake item",
          60
        );

        this.timeout(5000); 
        await delay(1000);                                                                        // приостанавливает выполнение теста на
                                                                                                  // 1 секунду, чтобы имитировать время, которое
                                                                                                  // проходит с момента создания аукциона до
                                                                                                  // покупки товара.

        const buyTx = await auct.connect(buyer).buy(0, { value: ethers.parseEther("0.0001") });   // getPriceFor вызывается внутри buy, 
                                                                                                  // чтобы вычислить текущую цену товара с учетом
                                                                                                  // прошедшего времени и примененной скидки.
        const cAuction = await auct.auctions(0);
        const finalPrice = BigInt(cAuction.finalPrice); 
        const fee = finalPrice * BigInt(10) / BigInt(100); 
        const sellerAmount = finalPrice - fee; 

        await expect(() => buyTx).to.changeEtherBalance(
          seller,
          sellerAmount.toString()                                                       
        );                                                                        // в ethers v6 произошла замена класса BigNumber на встроенный в
                                                                                  // js bigint. cAuction.finalPrice извлекается из контракта в
                                                                                  // solidity, где хранится в uint256, это позволяет сохранять
                                                                                  // большие числа wei. TypeScript не поддерживает напрямую
                                                                                  // uint256 из Solidity, так как такой тип данных существует
                                                                                  // только в Solidity. В TypeScript такие большие числа не могут
                                                                                  // быть корректно представлены стандартным числовым типом number.
                                                                                  // Поэтому нужно делать преобразование в bigint. Далее нужно
                                                                                  // преобразовывать число в строку через toString(), чтобы
                                                                                  // обеспечить совместимость типов при проверке. 
                                                                                  // sellerAmount.toString() просто предоставляет корректный 
                                                                                  // тип данных для библиотеки chai. При этом само сравнение
                                                                                  // будет происходить по числовому значению, поскольку библиотека
                                                                                  // понимает, что проверяется изменение баланса, который (баланс)
                                                                                  // является числовым значением.
        await expect(buyTx)
          .to.emit(auct, 'AuctionEnded')
          .withArgs(0, finalPrice.toString(), buyer.address);                     // finalPrice преобразуется в строку с помощью toString(),
                                                                                  // чтобы соответствовать типу данных, ожидаемому Chai. 
                                                                                  // в контракте финальная цена хранится в формате uint256,
                                                                                  // но для проверки в тестах она преобразована в строку.

        await expect(
          auct.connect(buyer).buy(0, { value: ethers.parseEther("0.0001") })      
        ).to.be.revertedWith('stopped!');                                          // проверяет, что контракт корректно обрабатывает ситуацию,
                                                                                   // когда попытка покупки аукциона, который уже был остановлен
                                                                                   // (или завершен), должна привести к откату транзакции
                                                                                   // с ошибкой.
    }); 


});