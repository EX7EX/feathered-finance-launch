// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title TestToken — open-mint ERC20 for Base Sepolia testnet onboarding.
/// @notice DO NOT DEPLOY TO MAINNET. Anyone can mint.
contract TestToken is ERC20 {
    uint8 private immutable _customDecimals;
    uint256 public immutable maxMintPerCall;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxMintPerCall_
    ) ERC20(name_, symbol_) {
        _customDecimals = decimals_;
        maxMintPerCall = maxMintPerCall_;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    /// @notice Open mint — testnet only. Caller can mint up to `maxMintPerCall` per tx.
    function mint(address to, uint256 amount) external {
        require(amount <= maxMintPerCall, "Exceeds max mint per call");
        _mint(to, amount);
    }
}