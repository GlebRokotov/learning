// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract DutchAuc {
    address public owner;                       // адрес владельца контракта, устанавливается в конструкторе 
    uint constant DURATION = 2 days;            // константа, определяющая длительность аукциона по умолчанию (2 дня).
    uint constant FEE = 10;                     // константа, определяющая комиссию (10%) с продажи.
    struct Auction {
        address payable seller;
        uint startingPrice;
        uint finalPrice;
        uint startAt;
        uint endsAt;
        uint discountRate;
        string item;
        bool stopped;
        
    }

    Auction[] public auctions;                   // хранит все созданные аукционы

    event AuctionCreated(uint index, string itemName, uint startingPrice, uint duration);                  // событие, которое вызывается при
                                                                                                           // создании нового аукциона.
    event AuctionEnded(uint index, uint finalPrice, address winner);                                       // событие, которое вызывается при
                                                                                                           // завершении аукциона.
    constructor() {
        owner = msg.sender;
    }

    function createAuction(uint _startingPrice, uint _discountRate, string memory _item, uint _duration) external {
                                                                                             // позволяет пользователю создать новый аукцион
                                                                                             // с указанием начальной цены, скорости снижения цены,
                                                                                             // названия товара и продолжительности аукциона.
                                                                                             // позволяет пользователю создать новый аукцион
                                                                                             // с указанием начальной цены, скорости снижения цены,
                                                                                             // названия товара и продолжительности аукциона.
        uint duration = _duration == 0 ? DURATION : _duration;  

        require(_startingPrice >= _discountRate * duration, "incorrect starting price");     // проверяет, что начальная цена (_startingPrice)
                                                                                             // достаточно велика, чтобы покрыть всю сумму скидки
                                                                                             // за всё время аукциона. суммарная скидка вычисляется
                                                                                             // как произведение скорости снижения цены
                                                                                             // (_discountRate) на длительность (_duration).
        Auction memory newAuction = Auction({
            seller: payable(msg.sender),
            startingPrice: _startingPrice,
            finalPrice: _startingPrice,
            discountRate: _discountRate,
            startAt: block.timestamp,                                                        // переменной startAt присваивается значение текущей
                                                                                             // метки времени, то есть время, когда вызвана функция
                                                                                             // createAuction и аукцион был создан. 
                                                                                             // это значение фиксирует момент начала аукциона.
            endsAt: block.timestamp + duration,
            item: _item,
            stopped: false
        });

        auctions.push(newAuction);

        emit AuctionCreated(auctions.length - 1, _item, _startingPrice, duration);            // Событие AuctionCreated записывает четыре значения:
                                                                                              // индекс созданного аукциона, название товара,
                                                                                              // начальную цену и длительность аукциона.
    }

    function getPriceFor(uint index) public view returns(uint) {                              // Рассчитывает текущую цену на основе времени,
                                                                                              // прошедшего с момента начала аукциона. принимает
                                                                                              // один аргумент — индекс аукциона в массиве auctions.
                                                                                              // возвращает значение типа uint (беззнаковое целое
                                                                                              // число), которое представляет текущую цену товара.
                                                                                              
        Auction memory cAuction = auctions[index];                                            // извлекает аукцион из массива auctions
                                                                                              // по переданному индексу и помещает копию данных
                                                                                              // о текущем аукционе в локальную переменную cAuction
        require(!cAuction.stopped, "stopped!");
        uint elapsed = block.timestamp - cAuction.startAt;                                    // время прошедшее с начала аукциона. текущее время
                                                                                              // block.timestamp - время начала аукциона 
                                                                                              // cAuction.startAt.

        uint discount = cAuction.discountRate * elapsed;                                      // Умножив скорость снижения цены на прошедшее время,
                                                                                              // получаем сумму скидки, накопленную с момента 
                                                                                              // старта аукциона до текущего момента.
        return cAuction.startingPrice - discount;                    
    }

    function buy(uint index) external payable {                         // принимает индекс аукциона в массиве auctions. аукцион помещается в 
                                                                        // массив в функции createAuction, где ему присваивается индекс.

        Auction storage cAuction = auctions[index];                     // использование storage позволяет изменять данные, хранящиеся на блокчейне,
                                                                        // что важно для функций, которые изменяют состояние контракта, как это
                                                                        // делает функция buy. В данном случае, строка 
                                                                        // Auction storage cAuction = auctions[index]; позволяет работать с
                                                                        // конкретным аукционом в массиве и изменять его состояние в хранилище.
        require(!cAuction.stopped, "stopped!");
        require(block.timestamp < cAuction.endsAt, "ended!");
        uint cPrice = getPriceFor(index);
        require(msg.value >= cPrice, "not enough funds!");
        cAuction.stopped = true;
        cAuction.finalPrice = cPrice;
        uint refund = msg.value - cPrice;
        if(refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        cAuction.seller.transfer(
            cPrice - ((cPrice * FEE) / 100)
        ); 
        emit AuctionEnded(index, cPrice, msg.sender);                   // фиксирует индекс завершившегося аукциона, финальную стоимость и 
                                                                        // адрес покупателя. 
    }
}