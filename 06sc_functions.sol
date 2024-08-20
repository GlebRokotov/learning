// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract Demo {
	// public можно вызывать извне путём отправки транзакции и изнутри контракта (может обратиться другая функция)         
    // external можно обращаться только извне
    // internal можно обращаться только изнутри самого смарт-контракта и те контракты которые наследуют данному контрату
    // private можно обращаться только изнутри контракта, но не из его потомка

    uint public balance;

    fallback() external payable {                                  // вызывается автоматически, если относительно смарт-контракта
                                                                   // была вызвана транзакция с неизвестным именем функции
        
    }
    receive() external payable {
        
    }

    function pay() external payable {
        balance += msg.value;
    }

    function setMessage(string memory newMessage) external {           // (пример фунции которая
                                                                       // вызывается через транзакцию)
        message = newMessage;
    }

    function getBalance() public view returns(uint _balance) {      // view может только читать данные в блокчейне,
                                                                    // но их не модифицировать
        _balance = address(this).balance;
    }

	string message = "hello!"; // state
    function getMessage() external view returns(string memory) {
        return message;
    }

    function rate(uint amount) public pure returns(uint) {          // pure не может читать никакие внешние данные за пределами
                                                                    // функции (обычно служебные функции)
        return amount * 3;
    }
}