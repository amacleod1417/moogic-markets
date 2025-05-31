// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceReader {
    function getCurrentPriceWithDecimals(string memory symbol)
        external
        view
        returns (uint256 price, uint256 decimals);
}