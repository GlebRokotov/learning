// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo {
    // Enum                                                     // Enum это тип данных перечисления, записывает 
                                                                // возможные состояния переменной
    enum Status { Paid, Delivered, Received }
    Status public currentStatus;                                // При проверке значения возвращает индекс 
                                                                // текущего значения

    function paid() public {
        currentStatus = Status.Paid;
    }

    function delivered() public {
        currentStatus = Status.Delivered;
    }

    // Array
    // Fixed size:
    uint[3][2] public items;                                     // многомерные массивы читаются с конца
                                                                 // первая справа размерность это количество веток
                                                                 // следующая количество элементво в каждой ветке
    function fixedSize() public {
        items = [
            [3,4,5],
            [6,7,8]
        ];
    }

    // Dynamic
    uint[] public itemsD;
    uint public len;
    function dynArr() public {
        itemsD.push(4);                                              // push работает только для динамических массивов
        itemsD.push(5);
        len = itemsD.length;
    }

    function sampleMemory() public pure  returns(uint[] memory) {    
        uint[] memory tempArray = new uint[](10);                   // пример массива созданого в памяти
        tempArray[0] = 1;
        return tempArray;
    }

    // Byte
    bytes32 public myVar = "test here"; // fixed                             
    bytes public myDynVar = "test here"; // dynamic                 // по умолчанию длина динамического массива 32 байта

    function firstByte() public view returns(bytes1) {
        return myDynVar[0];
    }

    // Struct
    struct Payment {                                               // структура данных для платежа 
        uint amount;
        uint timestamp;
        address from;
        string message;
    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;                          // содержит порядковый номер платежа и сам платеж
                                                                    // представленный структурой данных Payment 
    }

    mapping(address => Balance) public balances;                    // в этом mapping ключами являются address,
                                                                    // а значениями — структуры Balance.

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {      // функция для получения информации
                                                                                               // о конкретном платеже из
                                                                                               // mapping payments
        return balances[_addr].payments[_index];
    }

    function pay(string memory message) public payable {             // функция обработки платежа
        uint paymentNum = balances[msg.sender].totalPayments;        // при первом обращщении  к balances[msg.sender], 
                                                                     // Solidity создает новый объект Balance для msg.sender
                                                                     // с дефолтными значениями: счетчик totalPayments
                                                                     // будет равен 0, а маппинг payments будет пустым.
        balances[msg.sender].totalPayments++;                        // инкрементируем
        Payment memory newPayment = Payment(                         // Создаём функцию для заполнения полей платежа согласно
                                                                     // структуре Payment определенной в строке 56, чтобы сохранить
                                                                     // её в значении mapping струтуры Balance из строки 63
            msg.value,         // количество денег
            block.timestamp,   // информация о метке времени этого блока
            msg.sender,        // адрес отправителя
            message            // хранит сообщение прикрепленное к платежу
        );

        balances[msg.sender].payments[paymentNum] = newPayment;       // по умолчанию при первом обращении totalPayments
                                                                      // будет равен 0. это будет номером для первого платежа
                                                                      // с адреса отправителя. после этого мы инкрементируем 
                                                                      // totalPayments и это значение сохраняется за пределами 
                                                                      // функции. Дальше в этой функции мы используем 
                                                                      // paymentsNum до инкрементирования, 
                                                                      // чтобы записать его ключом mapping payments (uint) 
                                                                      // для текущего платежа. Следующие платёж с этого же адреса
                                                                      // получит totalPayments равный 1. Ничего не перезатрёт,
                                                                      // но стоит держать в уме, что счёт платежей мы начинаем с 0.
    }
}
