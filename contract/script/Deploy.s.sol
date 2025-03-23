// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RollupBridge.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address verifierAddress = vm.envAddress("VERIFIER_ADDRESS");
        bytes32 programVKey = vm.envBytes32("PROGRAM_VKEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        
        RollupBridge bridge = new RollupBridge(
            verifierAddress,
            programVKey,
            usdcAddress
        );
        
        vm.stopBroadcast();

        console.log("RollupBridge deployed at:", address(bridge));
    }
} 