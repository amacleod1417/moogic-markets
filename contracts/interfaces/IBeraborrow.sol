// interfaces/IBeraborrow.sol
pragma solidity ^0.8.20;

interface IBeraborrow {
    function createVault(address owner) external returns (uint256);
}