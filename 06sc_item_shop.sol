// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract ItemShop {
    mapping (address => bool) buyers;
    uint256 public price = 2 ether;
    address public owner;
    address public shopAddress;
    bool fullyPaid; 
    
    event ItemFullyPaid(uint _price, address _shopAddress);

    constructor() {
        owner = msg.sender;
        shopAddress = address(this);
    }
    
    function getBuyer(address _addr) public view returns(bool) {                            // функция для проверки является
                                                                                            // ли адрес добавленым в список
                                                                                            // потенциальных покупателей
        require(owner == msg.sender, "You are not an owner!");
        
        return buyers[_addr];
    }
    
    function addBuyer(address _addr) public {                                               // функция для добавления адреса
                                                                                            // потенциального покупателя
        require(owner == msg.sender, "You are not an owner!");
        
        buyers[_addr] = true;
    }
    
    function getBalance() public view returns(uint) {
        return shopAddress.balance;
    }
    
    function withdrawAll() public {
        require(owner == msg.sender && fullyPaid && shopAddress.balance > 0, "Rejected");
        
        address payable receiver = payable(msg.sender);
        
        receiver.transfer(shopAddress.balance);
    }
    
    receive() external payable {                                                        // функция для покупки, доступна
                                                                                        // только если адрес с которого вызывается
                                                                                        // транзакция предварительно добавлен
                                                                                        // в список покупателей
        require(buyers[msg.sender] && msg.value <= price && !fullyPaid, "Rejected");
        
        if(shopAddress.balance == price) {
            fullyPaid = true;
            
            emit ItemFullyPaid(price, shopAddress);
        }
    }
}