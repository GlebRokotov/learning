// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract Tree {
    bytes32[] public hashes;
    string[4] transactions = [
        "TX1: Gleb -> Yana",
        "TX2: Gleb -> Bob",
        "TX3: Yana -> Gleb",
        "TX4: Bob -> Yana"
    ];

    constructor() {
        for(uint i = 0; i < transactions.length; i++) {
            hashes.push(makeHash(transactions[i]));
        }

        uint count = transactions.length;
        uint offset = 0;

        while(count > 1) {
            for(uint i = 0; i < count - 1; i += 2) {
                hashes.push(keccak256(
                    abi.encodePacked(
                        hashes[offset + i], hashes[offset + i + 1]
                    )
                ));
            }
            offset += count;
            count = count / 2;
        }
    }

    function verify(string memory transaction, uint index, bytes32 root, bytes32[] memory proof) public pure returns(bool) {

    // значения для проверки
    // "TX3: Yana -> Gleb"
    // 2
    // 0x219204f65c522416fc4f9d36b61268d4b2e1c7f75d8e5b290f718730de34119c root
    // 0xf944b214d31d207e1978b2c56c421b768e7184a1b7a76900d803c9bca2e1e3e3 proof 3 
    // 0xf86d177e2d07422b364adf853f585d317a285cb6e39443f7e1793e92f3f65b69 proof 4

        bytes32 hash = makeHash(transaction);
        for(uint i = 0; i < proof.length; i++) {
            bytes32 element = proof[i];
            if(index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, element));
            } else {
                hash = keccak256(abi.encodePacked(element, hash));
            }
            index = index / 2;
        }
        return hash == root;
    }

    function encode(string memory input) public pure returns(bytes memory) {      // после выполнения будет содержать байтовое
                                                                                  // представление строки которую мы передали,
                                                                                  // например строки:"TX1: Gleb -> Yana", 
                                                                                  // которое может быть использовано, например,
                                                                                  // для создания хэша с помощью keccak256.
        return abi.encodePacked(input);
    }

    function makeHash(string memory input) public pure returns(bytes32) {         // принимает на вход байтовый массив
                                                                                  // и возвращает хэш фиксированного
                                                                                  // размера bytes32.
        return keccak256(
            encode(input)
        );
    }
}
