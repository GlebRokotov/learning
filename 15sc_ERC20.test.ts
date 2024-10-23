import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { GRToken } from "../typechain-types/15sc_ERC20.sol/GRToken";
import { GRShop } from "../typechain-types/15sc_ERC20.sol/GRShop";

describe("GRShop", function () {

    async function deploy() {                                                          // функция deploy подготавливает все необходимое для
                                                                                       // тестирования: разворачивает контракт GRShop, получает
                                                                                       // связанный с ним токен и предоставляет доступ к обоим 
                                                                                       // контрактам, а также к аккаунтам owner и buyer.
        const [owner,buyer] = await ethers.getSigners();
        const GRShopFactory = await ethers.getContractFactory("GRShop", owner);
        const shop: GRShop = await GRShopFactory.deploy();                             // здесь используется TypeScript для указания типа
                                                                                       // переменной shop. Это помогает гарантировать, что shop
                                                                                       // будет иметь тип, соответствующий интерфейсу GRShop, 
                                                                                       // который был сгенерирован TypeChain. Таким образом, вы
                                                                                       // получаете доступ ко всем функциям и свойствам контракта
                                                                                       // с проверкой типов на этапе компиляции.
        await shop.waitForDeployment();
        const tokenAddress = await shop.token();                                       // получаем адрес токена, связанного с экземпляром магазина
                                                                                       // 'shop'
        const token: GRToken = await ethers.getContractAt("GRToken", tokenAddress, owner);   // создаём экземпляр контракта токена (GRToken)
                                                                                             // по его адресу, что позволяет взаимодействовать с
                                                                                             // его методами, используя ABI и контекст владельца.
        return { owner, buyer, shop, token }
    }

    it("should have an owner and a token", async function() {
        const { owner, shop, token } = await loadFixture(deploy);
        expect(await shop.owner()).to.eq(owner.address);                               // проверяем, что адрес, возвращаемый методом owner()
                                                                                       // контракта shop, точно соответствует адресу аккаунта 
                                                                                       // owner, который мы использовали для развертывания 
                                                                                       // контракта.

        expect(await shop.token()).to.be.properAddress;                                // properAddress - это специальный матчер, который
                                                                                       // проверяет, является ли переданное значение допустимым
                                                                                       // Ethereum адресом. properAddress проверяет что значение
                                                                                       // должно быть строкой, строка должна начинаться с "0x", 
                                                                                       // после "0x" должно следовать 40 шестнадцатеричных символов
                                                                                       // (0-9 и a-f или A-F) и что адрес должен быть в правильном
                                                                                       // контрольном формате (checksummed), если содержит буквы.
        const shopTokenAddress = await shop.token();
        expect(shopTokenAddress).to.equal(token.target);                              // сравнивает адрес токена, полученный из контракта магазина
                                                                                       // (shopTokenAddress), с адресом токена который мы создали 
                                                                                       // в рамках теста и который типизирован с помощью TypeChain
        expect(await token.name()).to.equal("GRToken");
        expect(await token.symbol()).to.equal("GRT");

        const initialSupply = ethers.parseUnits("1000000", 18);                        // ethers.parseUnits("1000000", 18) создает число, которое
                                                                                       // представляет 1 миллион токенов в формате, используемом
                                                                                       // внутри смарт-контракта.

        expect(await token.balanceOf(shop.target)).to.equal(initialSupply);            // проверяем, что баланс токенов на контракте магазина
                                                                                       // (shop.target) равен ожидаемому значению initialSupply,
                                                                                       // который был инициализирован в тесте
    })

    it("allows to buy", async function() {
        const { buyer, shop, token } = await loadFixture(deploy);
        const tokenAmount = ethers.parseUnits("3", 18);
  
        const txData = {
          value: tokenAmount,
          to: shop.target
        }
  
        const tx = await buyer.sendTransaction(txData);
        await tx.wait();
  
        expect(await token.balanceOf(buyer.address)).to.eq(tokenAmount);                // после отправки транзакции с деньгами, проверяем что на
                                                                                        // счету buyer образуется нужное количество токенов
  
        await expect(() => tx).
          to.changeEtherBalance(shop, tokenAmount)                                      // проверяем с помощью метода changeEtherBalance, что 
                                                                                        // баланс контракта (shop) увеличился на количество эфира
                                                                                        // которое было передано в ходе выполнения транзакции
                                                                                        // (tokenAmount)
        await expect(tx)
          .to.emit(shop, "Bought")
          .withArgs(tokenAmount, buyer.address)                                         // проверяем, что в результате транзакции было вызвано
                                                                                        // событие 'Bought', и что оно было вызвано с правильными
                                                                                        // аргументами: количество токенов равное tokenAmount и
                                                                                        // адрес покупателя равный buyer.address.
     })

    it("allows to sell", async function() {
        const { buyer, shop, token } = await loadFixture(deploy);
        const tokenAmount = ethers.parseUnits("3", 18);
        
        const tx = await buyer.sendTransaction({                                        // тут адрес покупателя приобретает токены мазазина
                                                                                        // пересылая магазину эфир
          value: tokenAmount,
          to: shop.target
        })
        await tx.wait();
        const sellAmount = ethers.parseUnits("2", 18);                                  // переменная для обозначения количества токенов с аккаунта
                                                                                        // покупателя, которые он хочет продать обратно. (в данном
                                                                                        // случае 2 из 3).
  
        const approval = await token.connect(buyer).approve(shop.target, sellAmount);   // разрешаем магазину списывать количество токенов 
                                                                                        // (sellAmount) для продажи с аккаунта 'buyer' 
        await approval.wait();
        const sellTx = await shop.connect(buyer).sell(sellAmount); 
        expect(await token.balanceOf(buyer.address)).to.eq(ethers.parseUnits("1", 18)); 
  
        await expect(() => sellTx).
          to.changeEtherBalance(shop, -sellAmount)
  
        await expect(sellTx)
          .to.emit(shop, "Sold")
          .withArgs(sellAmount, buyer.address)
    })

})