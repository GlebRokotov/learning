    // SPDX-License-Identifier: MIT
    // OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)
    pragma solidity ^0.8.24;

    interface IERC20Errors {                                                                // интерфейс пользовательских ошибок для ERC20

        error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);    // ошибка, связанная с текущим балансом `sender`.
                                                                                            // используется при переводах. @param 'sender' - адрес
                                                                                            // отправителя токенов. @param 'balance' - текущий баланс
                                                                                            // взаимодействующего аккаунта. @param 'needed' - 
                                                                                            // минимальная сумма, необходимая для выполнения перевода.

        error ERC20InvalidSender(address sender);                                           // ошибка, связанная с `sender`. используется при
                                                                                            // переводах. @param 'sender' - адрес отправителя токенов.

        error ERC20InvalidReceiver(address receiver);                                       // ошибка, связанная с `receiver`. используется при 
                                                                                            // переводах. @param 'receiver' - адрес получателя токенов.

        error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);  // ошибка, связанная с `allowance` у `spender`. 
                                                                                            // используется при переводах. @param - 'spender' адрес,
                                                                                            // который может распоряжаться токенами без права
                                                                                            // собственности. @param 'allowance' - количество 
                                                                                            // токенов, которые может использовать `spender`. @param
                                                                                            // 'needed' - минимальная сумма, необходимая для
                                                                                            // выполнения перевода.

        error ERC20InvalidApprover(address approver);                                        // ошибка, связанная с `approver`, который подтверждает
                                                                                            // операцию. используется в процессах утверждения. @param
                                                                                            // 'approver' - адрес, инициирующий операцию утверждения.
                                                                                            
        error ERC20InvalidSpender(address spender);                                          // ошибка, связанная с `spender`, которому предоставляется
                                                                                            // разрешение. используется в процессах утверждения.
                                                                                            // @param 'spender' адрес, который может распоряжаться
                                                                                            // токенами без права собственности.                                   
    }