// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from"@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract FlowVaultEscrow is ReentrancyGuard {
    uint256 public nextEscrowId;

    enum EscrowState { Active, Claimed, Refunded }

    struct Escrow {
        address token;        
        address sender;
        address receiver;
        uint256 amount;
        uint256 expiry;       
        EscrowState state;
        bool isNative;
    }

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed id, address indexed sender, address indexed receiver, address token, uint256 amount, uint256 expiry, bool isNative);
    event EscrowClaimed(uint256 indexed id, address indexed receiver, uint256 when);
    event EscrowRefunded(uint256 indexed id, address indexed sender, uint256 when);

    constructor() {
        nextEscrowId = 1;
    }

    /// @notice Create an escrow for native currency.
    function createNativeEscrow(address receiver, uint256 expiry) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "amount>0");
        require(receiver != address(0), "invalid receiver");
        require(expiry > block.timestamp + 60, "expiry too soon"); // require at least 1 minute

        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            token: address(0),
            sender: msg.sender,
            receiver: receiver,
            amount: msg.value,
            expiry: expiry,
            state: EscrowState.Active,
            isNative: true
        });

        emit EscrowCreated(id, msg.sender, receiver, address(0), msg.value, expiry, true);
        return id;
    }

    /// @notice Create an escrow. Caller must approve this contract for `amount` tokens first.
    function createEscrow(address token, address receiver, uint256 amount, uint256 expiry) external nonReentrant returns (uint256) {
        require(amount > 0, "amount>0");
        require(receiver != address(0), "invalid receiver");
        require(expiry > block.timestamp + 60, "expiry too soon"); // require at least 1 minute

        // transfer tokens to contract
        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            token: token,
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            expiry: expiry,
            state: EscrowState.Active,
            isNative: false
        });

        emit EscrowCreated(id, msg.sender, receiver, token, amount, expiry, false);
        return id;
    }

    /// @notice Claim funds (receiver) before expiry
    function claimEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(e.state == EscrowState.Active, "not active");
        require(msg.sender == e.receiver, "only receiver");
        require(block.timestamp <= e.expiry, "expired");

        e.state = EscrowState.Claimed;
        if (e.isNative) {
            payable(e.receiver).transfer(e.amount);
        } else {
            bool ok = IERC20(e.token).transfer(e.receiver, e.amount);
            require(ok, "transfer failed");
        }
        emit EscrowClaimed(id, e.receiver, block.timestamp);
    }

    /// @notice Refund callable after expiry by anyone or by Forte-triggered relayer
    function refundEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(e.state == EscrowState.Active, "not active");
        require(block.timestamp > e.expiry, "not expired");

        e.state = EscrowState.Refunded;
        if (e.isNative) {
            payable(e.sender).transfer(e.amount);
        } else {
            bool ok = IERC20(e.token).transfer(e.sender, e.amount);
            require(ok, "transfer failed");
        }
        emit EscrowRefunded(id, e.sender, block.timestamp);
    }

    /// @notice View helper
    function getEscrow(uint256 id) external view returns (Escrow memory) {
        return escrows[id];
    }
}
