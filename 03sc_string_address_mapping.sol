// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; 

contract Demo {

	string public myStr = "test";                                                 // сохраняется в блокчейне

    function demo(string memory newValueStr) public {
       // string memory myTempStr = "temp";                                         // переменная существует до тех пор пока 
                                                                                  // работает функция. как только функция
                                                                                  // отработает это значение будет потеряно

        myStr = newValueStr;                                                      // в этой функции меняем значение переменной
                                                                                  // myStr сохраненной в блокчейне 
                                                                                  
                                                                                  // для строк в функции обязательно указание
                                                                                  // места хранения

                                                                                  // в solidity не реализована конкотенация и 
                                                                                  // сравнение строк. к отдельным элементам 
                                                                                  // строки нельзя обращаться по индексу
    }
		
	// ADDRESSES
	address public myAddr = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
		
	function transferTo(address targetAddr, uint amount) public {                  // функция для перевода денежных средств
                                                                                   // c баланса текущего смарт контракта.
                                                                                   // первый аргумент адрес получателя,
                                                                                   // второй количество wei
        address payable _to = payable(targetAddr);                                 
        _to.transfer(amount);
    }

    function getBalance(address targetAddr) public view returns(uint) {            // возвращает баланс передаваемого в функцию
                                                                                   // адреса 
        return targetAddr.balance;
    }
		
		// MAPPINGS:
		
    mapping (address => uint) public payments; // storage

    function receiveFunds() public payable {                                        // функция для приёма денежных средств
                                                                                    // на счёт текущего смарт контракта
        
        payments[msg.sender] = msg.value;                                           // помещает в ключ адрес отправителя
                                                                                    // денежных средств, а в значение их
                                                                                    // количество
    }
}