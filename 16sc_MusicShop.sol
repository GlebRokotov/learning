// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./16sc_ERC165.sol";
import "hardhat/console.sol";

contract MusicShop is ERC165 {
    struct Album {
        uint256 index;
        bytes32 uid;                                                                            // уникальный идентификатор альбома (UID)
        string title;
        uint256 price;
        uint256 quantity;                                                                       // доступное количество альбомов
    }

    struct Order {
        uint256 orderId;                                                                        // уникальный ID заказа
        bytes32 albumUid;                                                                       // UID альбома, на который сделан заказ
        address customer;
        uint256 orderedAt;
        OrderStatus status;                                                                     // текущий статус заказа
    }

    enum OrderStatus {
        Paid,
        Delivered
    }

    Album[] public albums;
    Order[] public orders;

    uint256 public currentIndex;
    uint256 public currentOrderId;

    address public owner;

    event AlbumBought(bytes32 indexed uid, address indexed customer, uint256 indexed timestamp);
    event OrderDelivered(bytes32 indexed albumUid, address indexed customer);

    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    constructor(address _owner) {                                                                  // в конструкторе инициализируется адрес
                                                                                                   // владельца. в данном случае _owner
                                                                                                   // это адрес который назначается владельцем
                                                                                                   // магазина 
        owner = _owner;
    }

    function addAlbum(bytes32 uid, string calldata title, uint256 price, uint256 quantity) external onlyOwner {
                                                                                                    // добавляет новый альбом в магазин
        albums.push(
            Album({
                index: currentIndex,
                uid: uid,
                title: title,
                price: price,
                quantity: quantity
            })
        );

        currentIndex++;
    }

    function buy(uint256 _index) external payable {                                                   // может принимать ETH благодаря модификатору
                                                                                                      // payable

        Album storage albumToBuy = albums[_index];                                                    // Album storage albumToBuy создаёт ссылку
                                                                                                      // на структуру Album, находящуюся в массиве
                                                                                                      // albums по индексу _index. storage тут 
                                                                                                      // указывает, что albumToBuy — это ссылка
                                                                                                      // на данные, хранящиеся в блокчейне. любые
                                                                                                      // изменения, сделанные через albumToBuy,
                                                                                                      // будут сразу же отражены в массиве albums.
                                                                                                     
        require(msg.value == albumToBuy.price, "invalid price");
        require(albumToBuy.quantity > 0, "out of stock!");

        albumToBuy.quantity--;

        orders.push(
            Order({
                orderId: currentOrderId,                                                                // изначально инициализируется значением 0
                                                                                                        // после добавления заказа в массив orders,
                                                                                                        // currentOrderId увеличивается на единицу,
                                                                                                        // чтобы следующий заказ получил новый
                                                                                                        // уникальный orderId.

                albumUid: albumToBuy.uid,                                                               // albumToBuy.uid задаётся при добавлении
                                                                                                        // нового альбома через addAlbum и хранится
                                                                                                        // в структуре Album в массиве albums.
                customer: msg.sender,
                orderedAt: block.timestamp,
                status: OrderStatus.Paid
            })
        );

        currentOrderId++;

        emit AlbumBought(albumToBuy.uid, msg.sender, block.timestamp);
    }

    function delivered(uint256 _index) external onlyOwner {                                              // функция для обновления статуса заказа,
                                                                                                         // отмечая его как доставленный
        Order storage currentOrder = orders[_index];

        require(currentOrder.status != OrderStatus.Delivered, "invalid status");

        currentOrder.status = OrderStatus.Delivered;

        emit OrderDelivered(currentOrder.albumUid, currentOrder.customer);
    }

    receive() external payable {                                                                          // если кто-то попытается отправить ETH
                                                                                                          // напрямую на адрес контракта (без
                                                                                                          // вызова какой-либо функции), сработает
                                                                                                          // функция receive(), которая немедленно
                                                                                                          // откатит (revert) транзакцию с 
                                                                                                          // сообщением 
                                                                                                          // "Please use the buy function to purchase albums!".
        revert("Please use the buy function to purchase albums!");
    }

    function allAlbums() external view returns (Album[] memory) {                                         // функция allAlbums возвращает копию
                                                                                                          // всех альбомов, хранящихся в контракте,
                                                                                                          // в виде массива Album[].
        uint totalAlbums = albums.length;
        Album[] memory albumsList = new Album[](totalAlbums);                                             // создаёт массив длиной totalAlbums
                                                                                                          // (равной количеству альбомов в albums).
        for (uint256 i = 0; i < totalAlbums; ++i) {
            albumsList[i] = albums[i];
        }

        return albumsList;
    }

    fallback() external {                                                                                  // является fallback-функцией и 
                                                                                                           // выполняется автоматически, когда
                                                                                                           // контракт получает вызов, который не
                                                                                                           // совпадает ни с одной из существующих
                                                                                                           // функций. в данном случае, функция
                                                                                                           // выводит в консоль содержимое
                                                                                                           // msg.data — данных, переданных в 
                                                                                                           // транзакции. 
        console.logBytes(msg.data);
    }
}