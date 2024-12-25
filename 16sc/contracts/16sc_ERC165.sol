// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

abstract contract ERC165 is IERC165 { 
                                                                                        // проверка поддержки только ERC165 используется редко,
                                                                                        // но может служить индикатором того, что контракт 
                                                                                        // поддерживает метод supportsInterface. обычно такую 
                                                                                        // проверку делают, чтобы безопасно проверить поддержку
                                                                                        // других интерфейсов, или когда взаимодействие требует 
                                                                                        // явного соответствия стандарту ERC165.

                                                                                        // interfaceId - контракт-потомок, такой как MusicShop,
                                                                                        // обрабатывает этот аргумент в функции supportsInterface,
                                                                                        // возвращая true или false в зависимости от того, 
                                                                                        // поддерживается ли интерфейс. Внутри supportsInterface
                                                                                        // контракт сравнивает переданный interfaceId с
                                                                                        // interfaceId поддерживаемых интерфейсов.

                                                                                        // Если сторонний контракт написан на Solidity и имеет
                                                                                        // доступ к интерфейсу, он может динамически вычислить
                                                                                        // interfaceId с помощью встроенной конструкции     
                                                                                        // type(interface_name).interfaceId.
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}
