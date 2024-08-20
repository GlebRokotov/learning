import { loadFixture, ethers, expect } from "./setup";

describe("Payments", function() {                                          // функция describe создаёт группу тестов связанных
                                                                           // с "Payments" смарт-контрактом. первый аргумент указывает
                                                                           // к какому смарт-контракту относятся все тесты внутри
                                                                           // этого блока, второй аргумент это функция содержащая
                                                                           // сами тесты.

    async function deploy() {                                              // асинхронная функция с именем deploy
      const [owner, user1, user2] = await ethers.getSigners();             // выполняет асинхронное получение списка доступных аккаунтов
                                                                           // из блокчейн-сети с помощью метода ethers.getSigners().
                                                                           // затем, с помощью деструктуризации, первые два аккаунта
                                                                           // из этого списка присваиваются переменным user1 и user2,
                                                                           // что позволяет использовать их для дальнейшего
                                                                           // взаимодействия с контрактами и проведения тестов.

      const Factory = await ethers.getContractFactory("Payments");         // Эта строка создает объект контрактной фабрики, 
                                                                           // который затем используется для развертывания нового
                                                                           // экземпляра контракта Payments на блокчейне.
                                                                           // await приостанавливает выполнение функции до тех пор,
                                                                           // пока Promise, возвращенный 
                                                                           // ethers.getContractFactory("Payments"), не будет выполнен,
                                                                           // обеспечивая доступ к объекту фабрики после успешного 
                                                                           // разрешения промиса.

      const payments = await Factory.deploy();                             // payments - константа указывающая на развёрнутый контракт
                                                                           // с её помощью можно вызывать функции контракта

      await payments.waitForDeployment();                                  // ждет завершения процесса развертывания смарт-контракта 
                                                                           // Payments на блокчейне. асинхронное выполнение с await 
                                                                           // приостанавливает выполнение функции до тех пор, пока 
                                                                           // промис, возвращаемый методом waitForDeployment, не будет 
                                                                           // разрешен. это обеспечивает гарантию того, что контракт
                                                                           // был успешно развернут и готов к использованию, прежде 
                                                                           // чем выполнять дальнейшие операции.
      return { owner, user1, user2, payments }                             // функция deploy() возвращает объект с тремя свойствами                                                                           
    }
  
    it("should be deployed", async function() {                            // блок it(); проверяет, что контракт развернут правильно                                                             
      const { payments } = await loadFixture(deploy);                      // выполняет развертывание тестового окружения с помощью
                                                                           // функции deploy, ожидает его завершения и извлекает 
                                                                           // развернутый контракт Payments для использования в 
                                                                           // последующих проверках 

      expect(payments.target).to.be.properAddress;                         // проверяет, что payments.target
                                                                           // (адрес развернутого контракта) является допустимым адресом
                                                                           // Ethereum.
      //console.log(payments.target);                                      // выводит адрес текущего контракта
    });

    it("should have 0 ethers by default", async function() {               // проверяет, что контракт имеет нулевой баланс по умолчанию
      const { payments } = await loadFixture(deploy);
      // const balance = await payments.currentBalance();
      const balance = await ethers.provider.getBalance(payments.target);   // получаем текущий баланс развернутого контракта
      expect(balance).to.eq(0);                                            // проверяем, что баланс равен 0
    });
  
    it("should be possible to send funds", async function() {              // проверяет, что контракт может принимать средства и
                                                                           // правильно записывать информацию о платеже
      const { user1, user2, payments } = await loadFixture(deploy);  
      const sum = 100; // wei
      const msg = "hello from hardhat"; 
       
      //console.log(await ethers.provider.getBalance(user2.address));
      const tx = await payments.connect(user2).pay(msg, { value: sum });   // подключаем user2 и отправляем средства с сообщением
      //console.log(await ethers.provider.getBalance(user2.address));
      const receipt = await tx.wait(1);                                    // ожидаем подтверждения транзакции
      const currentBlock = await ethers.provider.getBlock(                 // получаем информацию о текущем блоке
        await ethers.provider.getBlockNumber()
      );
  
      expect(tx).to.changeEtherBalance(user2, -sum);                       // проверяем, что баланс user2 уменьшился на sum. 
                                                                           // (-sum с минусом, потому что мы списываем деньги)  

      const newPayment = await payments.getPayment(user2.address, 0);      // получаем данные о платеже и помещаем в newPayment
  
      expect(newPayment.message).to.eq(msg);
      expect(newPayment.amount).to.eq(sum);
      expect(newPayment.from).to.eq(user2.address);
      expect(newPayment.timestamp).to.eq(currentBlock?.timestamp);
    });

    it("should correctly store two payments from the same user", async function() {
      const { user1, payments } = await loadFixture(deploy);

      const sum1 = 100; // wei
      const msg1 = "first payment";

      const tx1 = await payments.connect(user1).pay(msg1, { value: sum1 });    // тут делаем первый платеж
      await tx1.wait(1);

      const currentBlock1 = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
      );

      const sum2 = 200; // wei
      const msg2 = "second payment";

      const tx2 = await payments.connect(user1).pay(msg2, { value: sum2 });     // тут делаем второй платеж
      await tx2.wait(1);

      const currentBlock2 = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
      );

      const firstPayment = await payments.getPayment(user1.address, 0);        // получаем информацию о первом платеже
      expect(firstPayment.message).to.eq(msg1);
      expect(firstPayment.amount).to.eq(sum1);
      expect(firstPayment.from).to.eq(user1.address);
      expect(firstPayment.timestamp).to.eq(currentBlock1?.timestamp);

      const secondPayment = await payments.getPayment(user1.address, 1);      // получаем информацию о втором платеже
      expect(secondPayment.message).to.eq(msg2);
      expect(secondPayment.amount).to.eq(sum2);
      expect(secondPayment.from).to.eq(user1.address);
      expect(secondPayment.timestamp).to.eq(currentBlock2?.timestamp);
    });

    it("should set the owner correctly", async function() {                              // проверяет, что владелец установлен правильно
      const { owner, payments } = await loadFixture(deploy);

      expect(await payments.owner()).to.equal(owner.address);
    });

    it("should allow the owner to withdraw funds", async function() {                    // проверяет, что владелец может снять средства
      const { owner, user1, payments } = await loadFixture(deploy);

      const sum = 100; // wei
      const msg = "test payment";

      await payments.connect(user1).pay(msg, { value: sum });
    
      await expect(() =>
        payments.connect(owner).withdraw(sum)                                             // подключает владельца к контракту Payments, 
                                                                                          // что позволяет владельцу вызывать 
                                                                                          // функции контракта и  вызывает функцию
                                                                                          // withdraw с суммой sum, которую необходимо
                                                                                          // вывести.

      ).to.changeEtherBalance(owner, sum);                                                // проверяет, что баланс указанного адреса 
                                                                                          // (owner) изменяется на указанную сумму (sum)
                                                                                          // после выполнения транзакции.
    });

    it("should not allow non-owners to withdraw funds", async function() {                // проверяет, что не владелец не может
                                                                                          // снять средства
      const { user1, payments } = await loadFixture(deploy);

      await expect(payments.connect(user1).withdraw(100)).to.be.revertedWith("Only owner can call this function");
                                                                                          // Метод, который проверяет, что транзакция 
                                                                                          // отклоняется с определённым сообщением об ошибке
    });
});