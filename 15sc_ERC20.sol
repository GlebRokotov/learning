// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.24;

import {IERC20} from "./15sc_IERC20.sol";
import {IERC20Metadata} from "./15sc_IERC20Metadata.sol";
import {IERC20Errors} from "./15sc_IERC20Errors.sol";

abstract contract ERC20 is IERC20, IERC20Metadata, IERC20Errors {                     // реализация интерфейса {IERC20}. эта реализация не зависит
                                                                                      // от способа создания токенов, поэтому механизм эмиссии
                                                                                      // должен быть добавлен в производный контракт с
                                                                                      // использованием {_mint}. совет: подробное описание см. в
                                                                                      // нашем руководстве https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226
                                                                                      // значение по умолчанию для {decimals} — 18. чтобы изменить
                                                                                      // его, нужно переопределить эту функцию, чтобы она
                                                                                      // возвращала другое значение. реализация общих рекомендаций
                                                                                      // OpenZeppelin Contracts: функции вызывают 'revert' вместо 
                                                                                      // возврата `false` при неудаче. это поведение является 
                                                                                      // стандартным и не противоречит ожиданиям приложений ERC-20.
    
    mapping(address account => uint256) private _balances;                            // mapping с балансами адресов (аккаунтов и 
                                                                                      // смарт-контрактов)

    mapping(address owner =>                                                          // ключём выступает владелец, а значением адреса с правами
                                                                                      // на управление своими токенами в обозначенном размере
        mapping(
            address spender => uint256
        )
    ) private _allowances;

    uint256 private _totalSupply;                                                      // количество токенов в обороте

    string private _name;
    string private _symbol; 

    constructor(string memory name_, string memory symbol_) {                           // устанавливает значения для {name} и {symbol}. эти два
                                                                                        // значения являются неизменяемыми. они могут быть
                                                                                        // установлены только один раз при создании контракта.
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {                       // возвращает имя токена
        return _name;
    }

    function symbol() public view virtual returns (string memory) {                     // возвращает символ токена
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {                           // возвращает количество десятичных знаков, используемых 
                                                                                        // для отображения токена. Например, если `decimals` равно
                                                                                        // `2`, баланс в `505` токенов должен отображаться как
                                                                                        // `5.05` (`505 / 10 ** 2`). токены обычно используют
                                                                                        // значение 18, что имитирует соотношение между Ether
                                                                                        // и Wei. Это значение возвращается по умолчанию, если
                                                                                        // не переопределено. эта информация используется только
                                                                                        // для отображения и не влияет на арифметику контракта,
                                                                                        // включая {IERC20-balanceOf} и {IERC20-transfer}. 
        return 18;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {    // ридер для значения разрешения для 'spender'
                                                                                                  // относительно этого 'owner'
        return _allowances[owner][spender];
    }

    function transfer(address to, uint256 value) public virtual returns (bool) {        // Внутренний вызов функции _transfer, которая отвечает за
                                                                                        // проверку корректности условий перевода и обновление
                                                                                        // балансов. функция transfer служит лишь интерфейсом
                                                                                        // для вызова этой внутренней функции.
        address owner = msg.sender;
        _transfer(owner, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public virtual returns (bool) {    // содержит делегирование в служебную функцию '_approve'
                                                                                        // которая обновляет разрешение 'allowance' для указанного
                                                                                        // 'spender'. служебная функция обычно проверяет валидность
                                                                                        //  параметров и обновляет состояние контракта.
        address owner = msg.sender;
        _approve(owner, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {     // переводит `value` токенов от адреса
                                                                                                       // `from` к адресу `to`, используя
                                                                                                       // разрешение, выданное владельцем токенов.
                                                                                                       // внутренне вызывает `_spendAllowance`
                                                                                                       // для проверки и уменьшения разрешения,
                                                                                                       // а затем `_transfer` для перемещения 
                                                                                                       // токенов.
        address spender = msg.sender;
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {               // выполняет проверку на допустимость адресов
                                                                                         // (не допускает нулевые адреса) и вызывает внутреннее
                                                                                         // обновление балансов.
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    function _update(address from, address to, uint256 value) internal virtual {          // функция для обновления балансов при переводе, эмиссии
                                                                                          // или сжигании токенов.
        if (from == address(0)) {
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {                                                     // проверяем, что у отправителя достаточно токенов
                                                                                           // для перевода.
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                _totalSupply -= value;
            }
        } else {
            unchecked {
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {                           // при использовании этой версии
                                                                                                          // _approve без переопределений, emit
                                                                                                          // Approval всегда будет генерироваться
        _approve(owner, spender, value, true);
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {   // вторая версия с параметром emitEvent
                                                                                                          // даёт возможность отключать событие в
                                                                                                          // оптимизированных сценариях, если это
                                                                                                          // потребуется.
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {   // проверяет и уменьшает разрешение 'allowance'
                                                                                                 // для доверенного лица `spender`. если разрешение
                                                                                                 // меньше необходимой суммы, выбрасывает ошибку.
                                                                                                 // обновляет разрешение, не вызывая emit `Approval`.
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {                                             // если текущее разрешение не установлено на
                                                                                                 // максимальное значение uint256 (что
                                                                                                 // интерпретируется как бесконечное разрешение), 
                                                                                                 // продолжаем проверку.
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }

}

contract GRToken is ERC20 {
    address public shop;                                                                    // переменная для хранения адреса магазина

    constructor(address shop_, uint256 initialSupply) ERC20("GRToken", "GRT") {            // передаем имя и символ в базовый контракт ERC20
    
        shop = shop_;                                                                       // сохраняем адрес магазина

        _mint(msg.sender, initialSupply);                                                   // эмитируем начальное количество токенов для 
                                                                                            // развернувшего контракт
    }
}

contract GRShop {                                                                             // интерфейс IERC20 и контракт ERC20 реализуют только
                                                                                             // базовые функции управления токенами: переводы,
                                                                                             // управление разрешениями и эмиссию/сжигание токенов.
                                                                                             // их задача — обеспечивать стандартизированную
                                                                                             // функциональность, которая может быть использована в
                                                                                             // любых контрактах и приложениях. магазин 'MShop'
                                                                                             // добавляет к этому свою собственную бизнес-логику,
                                                                                             // связанную с покупкой и продажей токенов за эфир
                                                                                             // таким образом, разделение событий между контрактами
                                                                                             // позволяет четко разделять ответственность: базовый
                                                                                             // контракт токена отвечает за перемещения токенов,
                                                                                             // а контракт магазина — за бизнес-операции с ними.

    IERC20 public token;                                                                     // интерфейс токена (ERC20)
    address payable public owner;                                                            // владелец магазина (получает эфир от покупок токена)

    event Bought(uint256 _amount, address indexed _buyer);                                   // событие фиксирует покупку токенов в контексте
                                                                                             // конкретного магазина. оно сигнализирует, что
                                                                                             // пользователь купил определённое количество токенов,
                                                                                             // заплатив за них эфир. магазин может предлагать
                                                                                             // токены для покупки, но это не часть логики самого
                                                                                             // токена ERC20. это действие не связано с переводом
                                                                                             // токенов между двумя произвольными участниками 
                                                                                             // (что охватывается событием 'Transfer'), а отражает
                                                                                             // бизнес-операцию внутри магазина, поэтому событие
                                                                                             // 'Bought' добавляется именно в контракт 'MShop'

    event Sold(uint256 _amount, address indexed _seller);                                    // событие фиксирует, когда пользователь продаёт
                                                                                             // токены обратно магазину. оно сигнализирует, что
                                                                                             // пользователь передал токены магазину и получил
                                                                                             // взамен эфир. это также является частью 
                                                                                             // бизнес-логики конкретного магазина, а не общей
                                                                                             // логики управления токенами.
    constructor() {
        token = new GRToken(address(this), 1000000 * 10**18);                               // если бы мы хотели использовать decimals(), нам
                                                                                             // пришлось бы сделать это в отдельной функции после
                                                                                             // создания контракта. в свою очередь 10**18 экономит
                                                                                             // газ. decimals используется для информации для
                                                                                             // внешних систем, таких как кошельки, биржи или
                                                                                             // другие смарт-контракты, которые взаимодействуют с
                                                                                             // вашим токеном. они используют значение decimals()
                                                                                             // для правильного отображения баланса токенов. 
                                                                                             // например, если баланс в контракте равен
                                                                                             // 1000000000000000000, а decimals() возвращает 18,
                                                                                             // система знает, что нужно отобразить это 
                                                                                             // как 1.0 токен.

        owner = payable(msg.sender);                                                         // устанавливаем владельца магазина
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert IERC20Errors.ERC20InvalidSender(msg.sender);
        }
        _;
    }

    /* просто отправка токенов на адрес контракта не вызовет функцию sell() автоматически — нужно явно вызвать эту функцию, чтобы она обработала
    продажу. функция sell() в контракте предназначена для продажи токенов: мы вызываем её, указывая количество токенов, которые хотим продать.
    отправка токенов на контракт вручную (через Metamask или другие кошельки) не вызовет функцию sell(). Контракт магазина просто получит токены,
    но функция sell() должна быть вызвана отдельно.*/
    function sell(uint256 _amountToSell) external {                                           // продажа токенов за эфир. покупатель должен иметь
                                                                                              // достаточный баланс токенов и allowance. принимает
                                                                                              // аргументом количество токенов, которые 
                                                                                              // пользователь хочет продать магазину.
        if (_amountToSell == 0) {
            revert IERC20Errors.ERC20InsufficientBalance(msg.sender, 0, _amountToSell);       // нельзя продать 0 токенов
        }

        uint256 balance = token.balanceOf(msg.sender);                                        // запрашиваем баланс токенов для адреса, который
                                                                                              // вызвал текущую функцию, и сохраняет этот баланс в
                                                                                              // переменную balance.
        if (balance < _amountToSell) {
            revert IERC20Errors.ERC20InsufficientBalance(msg.sender, balance, _amountToSell);
        }

        uint256 allowance = token.allowance(msg.sender, address(this));                       // проверка allowance в данном случае предполагает,
                                                                                              // что где-то ранее (обычно вне вашего контракта)
                                                                                              // пользователь уже вызвал approve
        if (allowance < _amountToSell) {
            revert IERC20Errors.ERC20InsufficientAllowance(msg.sender, allowance, _amountToSell);
        }

        token.transferFrom(msg.sender, address(this), _amountToSell);                         // перевод токенов от пользователя магазину
        payable(msg.sender).transfer(_amountToSell);                                          // возврат эфира за токены. для сравнения, если бы
                                                                                              // это была передача токенов ERC20, код выглядел бы
                                                                                              // так: token.transfer(msg.sender, _amountToSell);

        emit Sold(_amountToSell, msg.sender);                                                 // эмитируем событие продажи
    }

    receive() external payable {                                                              // получение эфира и выдача токенов
        uint256 tokensToBuy = msg.value;  
        if (tokensToBuy == 0) {
            revert IERC20Errors.ERC20InsufficientBalance(msg.sender, msg.value, 1);           // проверяем, что количество отправленного эфира
                                                                                              // (msg.value) больше нуля
        }

        uint256 shopBalance = token.balanceOf(address(this)); 
        if (shopBalance < tokensToBuy) {
            revert IERC20Errors.ERC20InsufficientBalance(address(this), shopBalance, tokensToBuy); 
        }

        token.transfer(msg.sender, tokensToBuy);                                             
        emit Bought(tokensToBuy, msg.sender);   
    }

    function tokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function withdraw() external onlyOwner {
        owner.transfer(address(this).balance); 
    }
}