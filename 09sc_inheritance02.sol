// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./09sc_inheritance01.sol";

abstract contract Balances is Ownable {
    function getBalance() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function withdraw(address payable _to) public override virtual onlyOwner {
        _to.transfer(getBalance());
    }
}

contract MyContract is Ownable, Balances {
    constructor(address _owner) {
        owner = _owner;
    }

    function withdraw(address payable _to) public override(Ownable, Balances) onlyOwner {
        require(_to != address(0), "zero addr");
        super.withdraw(_to);
    }
}