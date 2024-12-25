// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./16sc_Album.sol";

contract AlbumTracker is Ownable {                                                               // контракт 'AlbumTracker' служит менеджером для
                                                                                                 // контрактов 'Album', контролируя их создание,
                                                                                                 // оплату и доставку
    enum AlbumState {
        Created,
        Paid,
        Delivered
    }

    struct AlbumProduct {
        Album album;
        AlbumState state;
        uint256 price;
        string title;
    }

    event AlbumStateChanged(address indexed _albumAddress, uint256 _albumIndex, uint256 _stateNum);

    mapping(uint256 => AlbumProduct) public albums;
    uint256 public currentIndex;                                                                 // начиная создавать альбомы, не устанавливая
                                                                                                 // значение для currentIndex, первый альбом
                                                                                                 // получит индекс 0

    constructor() Ownable(msg.sender) {}

    function createAlbum(uint256 _price, string memory _title) public {                          // функция принимает два параметра: _price 
                                                                                                 // (типа uint256) — цена нового альбома. _title
                                                                                                 // (типа string memory) — название нового альбома.
                                                                                                 // эти параметры передаются вручную при вызове
                                                                                                 // функции. любой, у кого есть доступ к публичной
                                                                                                 // функции createAlbum, может вызвать её и
                                                                                                 // передать нужные значения. пример вызова:
                                                                                                 // если вызов производится через интерфейс
                                                                                                 // пользователя или другой контракт, это может
                                                                                                 // выглядеть так:
                                                                                                 // albumTracker.createAlbum(100 ether, "Greatest Hits");
        
        Album newAlbum = new Album(_price, _title, currentIndex, this);                          // аргумент this это адрес текущего контракта
                                                                                                 // AlbumTracker, который передаётся в Album,
                                                                                                 // чтобы установить связь между Album и
                                                                                                 // AlbumTracker. каждый новый экземпляр Album
                                                                                                 // знает адрес своего трекера (AlbumTracker),
                                                                                                 // переданный через this в конструктор. этот адрес
                                                                                                 // позволяет Album в будущем вызывать функции
                                                                                                 // triggerPayment в AlbumTracker для обработки
                                                                                                 // платежей и изменения состояний.

        albums[currentIndex].album = newAlbum;
        albums[currentIndex].state = AlbumState.Created;
        albums[currentIndex].price = _price;
        albums[currentIndex].title = _title;

        emit AlbumStateChanged(address(newAlbum), currentIndex, uint256(albums[currentIndex].state));

        currentIndex++;
    }

    function triggerPayment(uint256 _index) public payable {
        require(albums[_index].state == AlbumState.Created, "This album is already purchased!");
        require(albums[_index].price == msg.value, "We accept only full payments!");

        albums[_index].state = AlbumState.Paid;

        emit AlbumStateChanged(address(albums[_index].album), _index, uint256(albums[_index].state));
    }

    function triggerDelivery(uint256 _index) public onlyOwner {
        require(albums[_index].state == AlbumState.Paid, "This album is not paid for!");

        albums[_index].state = AlbumState.Delivered;

        emit AlbumStateChanged(address(albums[_index].album), _index, uint256(albums[_index].state));
    }
}
