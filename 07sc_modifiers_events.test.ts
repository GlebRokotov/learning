import { BigNumberish, Contract, Signer } from "ethers";
import { loadFixture, ethers, expect } from "./setup";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ScModifiers } from "../typechain-types";

describe("ScModifiers", function() {                                       // функция describe создаёт группу тестов связанных
                                                                           // с смарт-контрактом к которому относятся все тесты внутри
                                                                           // этого блока, второй аргумент это функция содержащая
                                                                           // сами тесты.

    async function deploy() {                                              // асинхронная функция с именем deploy
      const [owner, user1, user2] = await ethers.getSigners();             // выполняет асинхронное получение списка доступных аккаунтов
                                                                           // из блокчейн-сети с помощью метода ethers.getSigners().
                                                                           // затем, с помощью деструктуризации, первые два аккаунта
                                                                           // из этого списка присваиваются переменным user1 и user2,
                                                                           // что позволяет использовать их для дальнейшего
                                                                           // взаимодействия с контрактами и проведения тестов.

      const Factory = await ethers.getContractFactory("ScModifiers");      // Эта строка создает объект контрактной фабрики, 
                                                                           // который затем используется для развертывания нового
                                                                           // экземпляра контракта ScModifiers на блокчейне.
                                                                           // await приостанавливает выполнение функции до тех пор,
                                                                           // пока Promise, возвращенный 
                                                                           // ethers.getContractFactory("ScModifiers"), не будет выполнен,
                                                                           // обеспечивая доступ к объекту фабрики после успешного 
                                                                           // разрешения промиса.

      const scModifiers = (await Factory.deploy()) as ScModifiers;         // scModifiers - константа указывающая на развёрнутый контракт
                                                                           // с её помощью можно вызывать функции контракта

      await scModifiers.waitForDeployment();                               // ждет завершения процесса развертывания смарт-контракта 
                                                                           // ScModifiers на блокчейне. асинхронное выполнение с await 
                                                                           // приостанавливает выполнение функции до тех пор, пока 
                                                                           // промис, возвращаемый методом waitForDeployment, не будет 
                                                                           // разрешен. это обеспечивает гарантию того, что контракт
                                                                           // был успешно развернут и готов к использованию, прежде 
                                                                           // чем выполнять дальнейшие операции.
      return { owner, user1, user2, scModifiers }                          // функция deploy() возвращает объект с тремя свойствами                                                                           
    }

    async function sendMoney(scModifiers: ScModifiers, sender: SignerWithAddress, amount: BigNumberish) {  
                                                                            // параметр scModifiers имеет тип ScModifiers. 
                                                                            // это тип, который обычно определяется в вашем TypeScript
                                                                            // проекте и представляет собой интерфейс или класс для
                                                                            // контракта. тип ScModifiers помогает TypeScript понять, 
                                                                            // какие методы и свойства доступны для объекта scModifiers.

                                                                            // параметр sender имеет тип SignerWithAddress. 
                                                                            // это тип, который указывает на объект, представляющий
                                                                            // учетную запись в блокчейне с адресом и методами для
                                                                            // подписи транзакций. SignerWithAddress обычно 
                                                                            // импортируется из библиотеки Hardhat или Ethers и 
                                                                            // включает в себя свойства и методы, необходимые для 
                                                                            // работы с аккаунтами в тестах. тип SignerWithAddress является частью 
                                                                            // пакета @nomicfoundation/hardhat-ethers, который интегрируется с ethers.js,
                                                                            // чтобы обеспечить более удобную работу с тестовыми учетными записями.
        const tx = await scModifiers.connect(sender).pay({ value: amount });
        await tx.wait();
    }

    it("should allow to send money", async function () {
        const {owner, user1, scModifiers } = await loadFixture(deploy);
    
        await sendMoney(scModifiers, user1, ethers.parseEther("1"));
    
        const contractBalance = await ethers.provider.getBalance(scModifiers.target);
        expect(contractBalance).to.equal(ethers.parseEther("1"));            // проверяет, что баланс контракта (contractBalance)
                                                                             // равен 1 эфиру.
    });  
    
    it("should allow owner to withdraw funds", async function () {
        const { owner, user1, scModifiers } = await loadFixture(deploy);
    
        await sendMoney(scModifiers, user1, ethers.parseEther("1"));
    
        const tx = await scModifiers.connect(owner).withdraw(owner.address);
    
        await expect(() => tx)
          .to.changeEtherBalances([scModifiers, owner], [-ethers.parseEther("1"), ethers.parseEther("1")]);
                                                                              // создает функцию, которая возвращает транзакцию tx. 
                                                                              // использование стрелочной функции () => tx в expect
                                                                              // позволяет вам проверять изменения состояния после
                                                                              // выполнения транзакции, проверяя, что транзакция tx 
                                                                              // приводит к ожидаемым изменениям балансов.
    });
    
    it("should not allow other accounts to withdraw funds", async function () {
        const { user1, user2, scModifiers } = await loadFixture(deploy);
    
        await sendMoney(scModifiers, user1, ethers.parseEther("1"));
    
        await expect(
          scModifiers.connect(user2).withdraw(user2.address)
        ).to.be.revertedWith("you are not an owner!");
    });

});