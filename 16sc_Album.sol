// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./16sc_AlbumTracker.sol";

contract Album {                                                                      // контракт для управления музыкальным альбомом. позволяет
                                                                                      // купить альбом за фиксированную цену и уведомляет 
                                                                                      // `AlbumTracker` о покупке.
    uint256 public price;
    string public title;
    bool public purchased;
    uint256 public index;
    AlbumTracker tracker;

    constructor(uint256 _price, string memory _title, uint256 _index, AlbumTracker _tracker) {
        price = _price;
        title = _title;
        index = _index;
        tracker = _tracker;
    }

    receive() external payable {
        require(purchased == false, "This album is already purchased!");
        require(price == msg.value, "We accept only full payments!");

        (bool success,) =
            address(tracker).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", index));
                                                                                       // (bool success,) - в Solidity низкоуровневый вызов .call
                                                                                       // возвращает два значения: bool success (показывает
                                                                                       // успешность вызова) и bytes memory data (содержит любые
                                                                                       // возвращённые данные). тут нас интересует только результат
                                                                                       // успешности вызова (success), поэтому второе возвращаемое
                                                                                       // значение игнорируется через запятую (, ). 

                                                                                       // address(tracker).call - address(tracker) превращает
                                                                                       // переменную tracker (которая является ссылкой на контракт
                                                                                       // AlbumTracker) в тип address, поскольку низкоуровневый
                                                                                       // вызов .call выполняется по адресу.

                                                                                       // abi.encodeWithSignature("triggerPayment(uint256)", index)
                                                                                       // abi.encodeWithSignature используется для кодирования
                                                                                       // данных о вызове функции в формат, который совместим с EVM.
                                                                                       // "triggerPayment(uint256)" это сигнатура функции,
                                                                                       // указывающая, что вызывается функция с именем
                                                                                       // triggerPayment, которая принимает один параметр типа
                                                                                       // uint256. index это значение, которое передаётся в функцию
                                                                                       // triggerPayment как аргумент. в данном случае это индекс
                                                                                       // текущего альбома. в результате abi.encodeWithSignature 
                                                                                       // возвращает байтовую строку, содержащую закодированный
                                                                                       // вызов triggerPayment(index).

                                                                                       // .call используется вместо прямого вызова для возможности
                                                                                       // передачи ether вместе с вызовом

                                                                                       // общий синтаксис функции .call:
                                                                                       // address(targetContract).call{value: amount, gas: gasAmount}(encodedFunctionCall);

        require(success, "Sorry, we could not process your transaction.");             // проверяем success, чтобы убедиться, что вызов
                                                                                       // прошёл успешно

        purchased = true;
    }
}