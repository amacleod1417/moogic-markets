// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILiquidStabilityPool {
    function offset(uint256 amount) external;
}

contract BerachainOffsetModule {
    address public moogicMarkets;
    ILiquidStabilityPool public lsp;

    constructor(address _moogic, address _lsp) {
        moogicMarkets = _moogic;
        lsp = ILiquidStabilityPool(_lsp);
    }

    modifier onlyMoogic() {
        require(msg.sender == moogicMarkets, "Not authorized");
        _;
    }

    function offsetLoss(uint256 amount) external onlyMoogic {
        // Logic to determine if LSP should cover it
        // Example: only allow up to 5% of LSP pool
        lsp.offset(amount);
    }
}
