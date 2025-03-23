// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RollupBridge.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

// Mock Verifier for testing
contract MockSP1Verifier is ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view override {
        // Just a mock that always passes verification
    }
}

contract RollupBridgeTest is Test {
    RollupBridge public bridge;
    MockUSDC public usdc;
    MockSP1Verifier public verifier;
    
    address public admin = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    bytes32 public programVKey = keccak256("test_program_vkey");
    
    function setUp() public {
        usdc = new MockUSDC();
        verifier = new MockSP1Verifier();
        bridge = new RollupBridge(address(verifier), programVKey, address(usdc));
        
        // Fund test users
        usdc.transfer(user1, 10000 * 10**6); // 10k USDC
        usdc.transfer(user2, 5000 * 10**6);  // 5k USDC
    }
    
    function testDeposit() public {
        uint256 depositAmount = 1000 * 10**6; // 1k USDC
        
        vm.startPrank(user1);
        usdc.approve(address(bridge), depositAmount);
        bridge.deposit(depositAmount);
        vm.stopPrank();
        
        assertEq(bridge.deposits(user1), depositAmount);
        assertEq(usdc.balanceOf(address(bridge)), depositAmount);
    }
    
    function testBatchVerification() public {
        // Setup: User deposits
        uint256 depositAmount = 1000 * 10**6; // 1k USDC
        
        vm.startPrank(user1);
        usdc.approve(address(bridge), depositAmount);
        bridge.deposit(depositAmount);
        vm.stopPrank();
        
        // Create withdrawal batch
        address[] memory users = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        users[0] = user1;
        amounts[0] = 500 * 10**6; // Withdraw 500 USDC
        
        bytes memory publicValues = abi.encode(users, amounts);
        bytes memory proofBytes = "0x"; // Empty proof for mock verifier
        
        // Process batch
        bridge.verifyAndUnlockBatch(publicValues, proofBytes);
        
        // Verify user received funds
        assertEq(usdc.balanceOf(user1), 9500 * 10**6); // 10k - 1k + 500 = 9.5k
    }
    
    function testRejectDuplicateBatch() public {
        // Setup: User deposits
        uint256 depositAmount = 1000 * 10**6;
        
        vm.startPrank(user1);
        usdc.approve(address(bridge), depositAmount);
        bridge.deposit(depositAmount);
        vm.stopPrank();
        
        // Create withdrawal batch
        address[] memory users = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        users[0] = user1;
        amounts[0] = 500 * 10**6;
        
        bytes memory publicValues = abi.encode(users, amounts);
        bytes memory proofBytes = "0x";
        
        // First verification should pass
        bridge.verifyAndUnlockBatch(publicValues, proofBytes);
        
        // Second verification with same batch should fail
        vm.expectRevert("Batch already processed");
        bridge.verifyAndUnlockBatch(publicValues, proofBytes);
    }
} 