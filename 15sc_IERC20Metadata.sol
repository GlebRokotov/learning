// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.24;

import {IERC20} from "./15sc_IERC20.sol";

interface IERC20Metadata is IERC20 {                            // интерфейс для дополнительных функций метаданных.

    function name() external view returns (string memory);      // возвращает имя токена.

    function symbol() external view returns (string memory);    // возвращает символ токена.

    function decimals() external view returns (uint8);          // Возвращает количество знаков после запятой (decimals).
}