// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {FlowVaultEscrow} from "../src/flowVault.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract FlowVaultEscrowTest is Test {
    FlowVaultEscrow public escrow;
    ERC20Mock public token;
    address public sender = address(this);
    address public receiver = address(0x2);
    uint256 public amount = 100e18;

    receive() external payable {}

    function setUp() public {
        escrow = new FlowVaultEscrow();
        token = new ERC20Mock();
        token.mint(address(this), 1000e18);
    }

    function testCreateEscrow() public {
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);

        (address tokenAddress, address escrowSender, address escrowReceiver, uint256 escrowAmount, uint256 escrowExpiry, FlowVaultEscrow.EscrowState state, bool isNative) = escrow.escrows(id);

        assertEq(tokenAddress, address(token));
        assertEq(escrowSender, sender);
        assertEq(escrowReceiver, receiver);
        assertEq(escrowAmount, amount);
        assertEq(escrowExpiry, expiry);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Active));
        assertEq(isNative, false);
        assertEq(token.balanceOf(address(escrow)), amount);
        vm.stopPrank();
    }

    function testCreateEscrowFailsWithZeroAmount() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        vm.expectRevert("amount>0");
        escrow.createEscrow(address(token), receiver, 0, expiry);
        vm.stopPrank();
    }

    function testCreateEscrowFailsWithInvalidReceiver() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        vm.expectRevert("invalid receiver");
        escrow.createEscrow(address(token), address(0), amount, expiry);
        vm.stopPrank();
    }

    function testCreateEscrowFailsWithExpiryTooSoon() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 59;
        vm.expectRevert("expiry too soon");
        escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();
    }

    function testClaimEscrow() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        vm.startPrank(receiver);
        escrow.claimEscrow(id);

        (, , , , , FlowVaultEscrow.EscrowState state, ) = escrow.escrows(id);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Claimed));
        assertEq(token.balanceOf(receiver), amount);
        vm.stopPrank();
    }

    function testClaimEscrowFailsWhenNotReceiver() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        vm.startPrank(address(0x3)); // Not the receiver
        vm.expectRevert("only receiver");
        escrow.claimEscrow(id);
        vm.stopPrank();
    }

    function testClaimEscrowFailsWhenExpired() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        vm.warp(block.timestamp + 2 days);

        vm.startPrank(receiver);
        vm.expectRevert("expired");
        escrow.claimEscrow(id);
        vm.stopPrank();
    }

    function testRefundEscrow() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        vm.warp(block.timestamp + 2 days);

        escrow.refundEscrow(id);

        (, , , , , FlowVaultEscrow.EscrowState state, ) = escrow.escrows(id);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Refunded));
        assertEq(token.balanceOf(sender), 1000e18);
    }

    function testRefundEscrowFailsWhenNotExpired() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        vm.expectRevert("not expired");
        escrow.refundEscrow(id);
    }

    function testGetEscrow() public {
        vm.startPrank(sender);
        token.approve(address(escrow), amount);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createEscrow(address(token), receiver, amount, expiry);
        vm.stopPrank();

        FlowVaultEscrow.Escrow memory e = escrow.getEscrow(id);

        assertEq(e.token, address(token));
        assertEq(e.sender, sender);
        assertEq(e.receiver, receiver);
        assertEq(e.amount, amount);
        assertEq(e.expiry, expiry);
        assertEq(uint(e.state), uint(FlowVaultEscrow.EscrowState.Active));
        assertEq(e.isNative, false);
    }

    function testCreateNativeEscrow() public {
        vm.startPrank(sender);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createNativeEscrow{value: amount}(receiver, expiry);

        (address tokenAddress, address escrowSender, address escrowReceiver, uint256 escrowAmount, uint256 escrowExpiry, FlowVaultEscrow.EscrowState state, bool isNative) = escrow.escrows(id);

        assertEq(tokenAddress, address(0));
        assertEq(escrowSender, sender);
        assertEq(escrowReceiver, receiver);
        assertEq(escrowAmount, amount);
        assertEq(escrowExpiry, expiry);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Active));
        assertEq(isNative, true);
        assertEq(address(escrow).balance, amount);
        vm.stopPrank();
    }

    function testClaimNativeEscrow() public {
        vm.startPrank(sender);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createNativeEscrow{value: amount}(receiver, expiry);
        vm.stopPrank();

        uint256 receiverInitialBalance = receiver.balance;

        vm.startPrank(receiver);
        escrow.claimEscrow(id);

        (, , , , , FlowVaultEscrow.EscrowState state, ) = escrow.escrows(id);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Claimed));
        assertEq(receiver.balance, receiverInitialBalance + amount);
        vm.stopPrank();
    }

    function testRefundNativeEscrow() public {
        vm.startPrank(sender);
        uint256 expiry = block.timestamp + 1 days;
        uint256 id = escrow.createNativeEscrow{value: amount}(receiver, expiry);
        vm.stopPrank();

        uint256 senderInitialBalance = sender.balance;

        vm.warp(block.timestamp + 2 days);

        escrow.refundEscrow(id);

        (, , , , , FlowVaultEscrow.EscrowState state, ) = escrow.escrows(id);
        assertEq(uint(state), uint(FlowVaultEscrow.EscrowState.Refunded));
        assertEq(sender.balance, senderInitialBalance + amount);
    }
}
