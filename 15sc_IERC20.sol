// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.24;    

interface IERC20 {                                                                 // интерфейс стандарта ERC-20, как определено в ERC.

    event Transfer(address indexed from, address indexed to, uint256 value);       // событие, которое эмитируется, когда `value` токенов
                                                                                   // перемещаются с одного аккаунта (`from`) на другой (`to`).
                                                                                   // обратите внимание, что `value` может быть равно нулю.
    
    event Approval(address indexed owner, address indexed spender, uint256 value); // событие, которое эмитируется, когда allowance `spender`
                                                                                   // для `owner` устанавливается путем вызова {approve}.
                                                                                   // `value` — это новый allowance.

    function totalSupply() external view returns (uint256);                        // возвращает общее количество существующих токенов.

    function balanceOf(address account) external view returns (uint256);           // возвращает количество токенов, принадлежащих адресу `account`.

    function transfer(address to, uint256 value) external returns (bool);          // перемещает `value` количество токенов с аккаунта вызывающего
                                                                                   // контракта на аккаунт `to`. возвращает булево значение, 
                                                                                   // указывающее, была ли операция успешной. эмитирует 
                                                                                   // event {Transfer}.

    function allowance(address owner, address spender) external view returns (uint256);  // возвращает оставшееся количество токенов, которое
                                                                                         // `spender` сможет потратить от имени `owner` через
                                                                                         // {transferFrom}. По умолчанию равно нулю. Это значение
                                                                                         // изменяется при вызовах {approve} или {transferFrom}.

    function approve(address spender, uint256 value) external returns (bool);       // устанавливает `value` количество токенов в качестве
                                                                                    // разрешения для `spender` на распоряжение токенами
                                                                                    // вызывающего аккаунта. Возвращает булево значение,
                                                                                    // указывающее, была ли операция успешной. ВАЖНО: Изменение
                                                                                    // разрешения с помощью этого метода несёт в себе риск,
                                                                                    // что кто-то может использовать и старое, и новое разрешение
                                                                                    // из-за неблагоприятного порядка выполнения транзакций. 
                                                                                    // Одно из возможных решений этой проблемы — сначала установить
                                                                                    // разрешение `spender` на 0, а затем установить желаемое
                                                                                    // значение: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
                                                                                    // эмитирует event {Approval}.

    function transferFrom(address from, address to, uint256 value) external returns (bool); // перемещает `value` количество токенов с аккаунта
                                                                                            // `from` на аккаунт `to`, используя механизм
                                                                                            // разрешения. Затем `value` вычитается из разрешения
                                                                                            // вызывающего контракта. Возвращает булево значение,
                                                                                            // указывающее, была ли операция успешной. 
                                                                                            // Эмитирует event {Transfer}.
}