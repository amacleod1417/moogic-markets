// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRandomConsumer {
    function receiveRandom(uint256 requestId, uint256 random) external;
}