// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./12sc_interface_ilogger.sol";

contract Demo12 {
    ILogger logger;
    
    constructor(address _logger) {                                                // контракт Demo обращается к той реализации интерфейса,
                                                                                  // чей адрес был передан в его конструктор. он не выбирает
                                                                                  // между несколькими реализациями — выбор происходит в момент
                                                                                  // развертывания или передачи адреса в конструктор.
        logger = ILogger(_logger);
    }

    function payment(address _from, uint _number) public view returns(uint) {
        return logger.getEntry(_from, _number);
    }

    receive() external payable {
        logger.log(msg.sender, msg.value);
    }
}
