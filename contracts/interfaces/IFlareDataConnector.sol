// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFlareDataConnector {
    function getData(bytes32 dataId) external view returns (uint256 value, uint256 timestamp);
    function getCowStats(bytes32 cowId) external view returns (uint256 milk, uint256 steps, uint256 heartRate, uint256 timestamp);
}