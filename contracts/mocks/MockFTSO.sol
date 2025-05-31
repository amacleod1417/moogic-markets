// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockFTSO {
    uint256 public mockPrice = 150_000000; // $1.50
    uint256 public mockDecimals = 6;

    function getCurrentPriceWithDecimals(string memory) external view returns (uint256, uint256) {
        return (mockPrice, mockDecimals);
    }

    function setPrice(uint256 price, uint256 decimals) external {
        mockPrice = price;
        mockDecimals = decimals;
    }
}
