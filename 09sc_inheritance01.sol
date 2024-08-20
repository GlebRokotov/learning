// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "not an owner!");
        _;
    }

    function withdraw(address payable /*_to*/) public virtual onlyOwner {      // имя параметра _to закомментировано, что
                                                                               // устраняет предупреждение компилятора о
                                                                               // неиспользуемом параметре, но оставляет
                                                                               // возможность использования этого параметра
                                                                               // в сигнатуре функции. это полезно, если
                                                                               // предполагается, что производные контракты
                                                                               // будут использовать этот параметр.
        payable(owner).transfer(address(this).balance);
    }
}