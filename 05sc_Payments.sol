// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract Payments {
    address public owner;                                                                    // переменная для хранения адреса
                                                                                             // владельца
    struct Payment {
        uint amount;
        uint timestamp;
        address from;
        string message;
    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

    mapping(address => Balance) public balances;

    modifier onlyOwner() {                                                                   // эта строка объявляет модификатор с именем
                                                                                             // onlyOwner. Модификаторы в Solidity
                                                                                             // пишутся в форме функций, но вместо тела
                                                                                             // функции используется символ _, который
                                                                                             // будет заменен на тело функции, к которой
                                                                                             // применен модификатор.

        require(msg.sender == owner, "Only owner can call this function");                   // эта строка проверяет условие, что адрес,
                                                                                             // инициировавший вызов функции (msg.sender),
                                                                                             // совпадает с адресом владельца контракта
                                                                                             // (owner). require — это встроенная функция
                                                                                             // Solidity, которая проверяет указанное
                                                                                             // условие. если условие не выполняется,
                                                                                             // будет выведено сообщение об ошибке
                                                                                             // "Only owner can call this function"

        _;                                                                                   // когда функция, к которой применяется
                                                                                             // модификатор onlyOwner, будет вызвана,
                                                                                             // сначала выполнится проверка require,
                                                                                             // а затем выполнится тело функции,
                                                                                             // обозначенное символом _.
    }

     constructor() {
        owner = msg.sender;                                                                  // в конструкторе устанавливаем адрес
                                                                                             // владельца и сохраняем его в блокчейн
    }

    function currentBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    function pay(string memory message) public payable returns(uint) {
        uint paymentNum = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;

        Payment memory newPayment = Payment(
            msg.value,
            block.timestamp,
            msg.sender,
            message
        );

        balances[msg.sender].payments[paymentNum] = newPayment;

        return msg.value;
    }
    function withdraw(uint amount) public onlyOwner {                                         // onlyOwner: Модификатор, который 
                                                                                              // ограничивает выполнение функции 
                                                                                              // только владельцем контракта. Он 
                                                                                              // проверяет, что вызвавший адрес 
                                                                                              // (msg.sender) совпадает с адресом
                                                                                              // владельца (owner).

        require(amount <= address(this).balance, "Insufficient balance");                     // Условие, которое проверяет, что
                                                                                              // запрашиваемая сумма amount не превышает
                                                                                              // текущий баланс контракта 
                                                                                              //(address(this).balance).
        payable(owner).transfer(amount);
    }
}