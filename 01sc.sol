// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; 

contract MyShop {

    //0xd9145CCE52D386f254917e481eB44e9943F39138
    address public owner;                                   // переменная для хранения типа данных адрес   
    mapping (address => uint) public payments;

    constructor(){                                         // вызывается автоматически в момент размещения в блокчейне
                                                           // данные из конструктора сохраняются в блокчейне
        owner = msg.sender;                                // присваиваем переменной адрес того, кто развернул контракт
    }

    function payForItem () public payable {                // payable модификатор для возможности приёма денег фунцией
                                                           // когда фунция payable будет вызываться в фронтенде EVM автоматически
                                                           // обработает пришедшие средства и зачислит их на счёт контракта
        payments[msg.sender] = msg.value;
    }

    function withdrawAll () public {
        address payable _to = payable (owner);             // приведение типов адреса владельца 
                                                           // для возможности отправлять деньги 
        address _thisContract = address(this);             // переменная с адресом текущего контракта
        _to.transfer(_thisContract.balance);               // transfer переводит деньги на указанный адрес _to
                                                           // весь баланс текущего контракта _thisContract
    }
}