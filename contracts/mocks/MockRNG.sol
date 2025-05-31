// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRandomConsumer {
    function receiveRandom(uint256 requestId, uint256 random) external;
}

contract MockRNG {
    address public consumer;

    constructor(address _consumer) {
        consumer = _consumer;
    }

    function requestRandom(uint256 requestId) external {
        require(msg.sender == consumer, "Not authorized");

        uint256 fakeRandom = uint256(keccak256(abi.encodePacked(block.timestamp, requestId)));
        IRandomConsumer(consumer).receiveRandom(requestId, fakeRandom);
    }
}
