// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockFDC {
    mapping(bytes32 => bytes) public data;

    function setData(bytes32 queryId, bytes memory value) public {
        data[queryId] = value;
    }

    function getData(bytes32 queryId) external view returns (bytes memory) {
        return data[queryId];
    }
}

