// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; 

contract Demo {

    // bool public myBool = true;                    // переменная состояния

    // function myFunc(bool _inputBool) public {
    //     bool localBool = false;                   // локальная переменная
    //     localBool && _inputBool // AND            // операции с булевыми типами
    //     localBool || _inputBool // OR
    //     localBool == _inputBool // EQUAL
    //     localBool != _inputBool // NOT EQUAL
    //     !localBool // NOT
		
    //     if(_inputBool || localBool) {             // часто используются для проверки условия
    //     }
    // }
		
		
		// UNSINGED INTEGERS
    // uint public myUint = 42;
    // 2 ** 256
		
    // uint8 public mySmallUint = 2;
    // 2 ** 8 = 256
    // 0 ---> (256-1)
    // uint16
    // uint24
    // uint32
    // ...uint256
		
		// SIGNED INTEGERS
    // int public myInt = -42;
    // int8 public mySmallInt = -1;
    // 2 ** 7 = 128
    // -128 --> (128-1)
		
		
		// MIN-MAX
		// uint public maximum;
    // function getMax() public {
    //     maximum = type(uint8).max;                 // проверка максимально допустимого значения переменной
    // }
		
		
		// MATH
		// function math(uint _inputUint) public {
    //     uint localUint = 42;
    //     localUint + 1;
    //     localUint - 1;
    //     localUint * 2;
    //     localUint / 2;
    //     localUint ** 3;                            // возведение в степень
    //     localUint % 3;
    //     -myInt;

    //     localUint == 1;
    //     localUint != 1;
    //     localUint > 1;
    //     localUint >= 1;
    //     localUint < 2;
    //     localUint <= 2;
    // }
		
		
		// UNCHECKED
    uint8 public myVal = 1;

    function dec() public {
        unchecked {                                   // при выходе за область значения переходит 
                                                      // к допустимой границе диапазона по модульной математике          
            myVal--;
        }
    }
}