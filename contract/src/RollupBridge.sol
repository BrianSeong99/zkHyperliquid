// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}

interface ISP1VerifierWithHash is ISP1Verifier {
    function VERIFIER_HASH() external pure returns (bytes32);
}

contract RollupBridge {
    address public admin;
    ISP1Verifier public verifier;
    bytes32 public immutable programVKey;
    IERC20 public immutable usdc;

    mapping(address => uint256) public deposits; // user => amount
    mapping(bytes32 => bool) public processedBatches; // batchRoot => processed

    event Deposited(address indexed user, uint256 amount);
    event BatchVerified(bytes32 indexed batchRoot);
    event Withdrawn(address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _verifier, bytes32 _programVKey, address _usdc) {
        admin = msg.sender;
        verifier = ISP1Verifier(_verifier);
        programVKey = _programVKey;
        usdc = IERC20(_usdc);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        deposits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function verifyAndUnlockBatch(
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external onlyAdmin {
        require(!processedBatches[keccak256(publicValues)], "Batch already processed");
        
        verifier.verifyProof(programVKey, publicValues, proofBytes);
        processedBatches[keccak256(publicValues)] = true;
        emit BatchVerified(keccak256(publicValues));
        
        // Decode users and balances from publicValues
        (address[] memory users, uint256[] memory amounts) = abi.decode(publicValues, (address[], uint256[]));
        require(users.length == amounts.length, "Mismatched users and amounts");

        for (uint256 i = 0; i < users.length; i++) {
            require(usdc.transfer(users[i], amounts[i]), "Transfer failed");
            emit Withdrawn(users[i], amounts[i]);
        }
    }
} 