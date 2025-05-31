// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFlareDataConnector {
    function getData(bytes32 queryId) external view returns (bytes memory);
}