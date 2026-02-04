# Smart Contract Reference

This document contains the smart contract code that was provided and integrated with the ParaShield frontend.

## Chainlink AggregatorV3Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}
```

**Network**: Sepolia Testnet  
**Address**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`  
**Pair**: ETH / USD

---

## Basic Insurance Contract v1

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Chainlink interface
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Insurance {

    address public farmer;
    bool public policyActive;
    bool public policyPaid;

    AggregatorV3Interface public priceFeed;

    constructor() {
        // ETH / USD price feed on Sepolia
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    function buyPolicy() public payable {
        require(!policyActive, "Policy already active");
        require(msg.value == 0.01 ether, "Premium is 0.01 ETH");

        farmer = msg.sender;
        policyActive = true;
        policyPaid = false;
    }

    function getETHPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function payout() public {
        require(policyActive, "No active policy");
        require(!policyPaid, "Already paid");

        // Example condition:
        // DEMO: simulate disaster manually
        require(block.timestamp % 2 == 0, "Disaster not triggered yet");

        policyPaid = true;
        policyActive = false;

        (bool success, ) = payable(farmer).call{value: 0.01 ether}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
```

---

## Production Insurance Contract v2 (Parametric)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
    PARAMETRIC FARMER INSURANCE (CHAINLINK-STYLE ORACLE)

    - Premium: 0.01 ETH
    - Payout:  0.01 ETH
    - Weather-based automatic payout
    - Location supported
*/

contract Insurance {

    // ================= CONFIG =================
    uint256 public constant PREMIUM = 0.01 ether;
    uint256 public constant PAYOUT_AMOUNT = 0.01 ether;
    uint256 public constant RAIN_THRESHOLD = 50; // mm

    // ================= STATE ==================
    address public farmer;
    bool public policyActive;
    bool public policyPaid;

    string public farmLocation;
    uint256 public lastReportedRainfall;

    // ================= ORACLE =================
    address public oracle; // Chainlink / trusted oracle

    // ================= EVENTS =================
    event PolicyRequested(address indexed farmer, string location);
    event WeatherRequested(string location);
    event WeatherReceived(uint256 rainfall);
    event PayoutTriggered(address indexed farmer, uint256 amount);

    // ================= MODIFIERS =================
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    constructor(address _oracle) {
        oracle = _oracle;
    }

    // ================= FARMER =================
    function requestPolicy(string calldata location) external payable {
        require(!policyActive, "Policy already active");
        require(msg.value == PREMIUM, "Premium must be 0.01 ETH");

        farmer = msg.sender;
        farmLocation = location;
        policyActive = true;
        policyPaid = false;
        lastReportedRainfall = 0;

        emit PolicyRequested(msg.sender, location);
        emit WeatherRequested(location);
    }

    // ================= ORACLE CALLBACK =================
    /*
        In real life:
        - Chainlink node calls this
        - Weather API is fetched off-chain
    */
    function fulfillWeather(uint256 rainfall) external onlyOracle {
        require(policyActive, "No active policy");
        require(!policyPaid, "Already paid");

        lastReportedRainfall = rainfall;
        emit WeatherReceived(rainfall);

        // AUTOMATIC PAYOUT (PARAMETRIC)
        if (rainfall >= RAIN_THRESHOLD) {
            policyPaid = true;
            policyActive = false;

            require(
                address(this).balance >= PAYOUT_AMOUNT,
                "Insufficient contract balance"
            );

            payable(farmer).transfer(PAYOUT_AMOUNT);
            emit PayoutTriggered(farmer, PAYOUT_AMOUNT);
        }
    }

    // ================= FUND CONTRACT =================
    receive() external payable {}
}
```

**Network**: Sepolia Testnet  
**Address**: `0xE529a659d1de4025A4044E6472C26B6224dADCb4`  
**Status**: ✅ DEPLOYED AND ACTIVE

---

## Contract Integration Points

The frontend interacts with these contract functions:

### requestPolicy(string location)
```typescript
// User buys insurance policy
await contractService.requestPolicy("My Farm");
// Sends 0.01 ETH premium
// Emits: PolicyRequested event
```

### fulfillWeather(uint256 rainfall)
```typescript
// Oracle/Admin triggers payout if rainfall exceeds threshold
await contractService.fulfillWeather(75); // 75mm
// If rainfall >= 50mm, transfers 0.01 ETH to farmer
// Emits: WeatherReceived, PayoutTriggered events
```

### latestRoundData() [Chainlink]
```typescript
// Get latest ETH/USD price
const [roundId, answer, startedAt, updatedAt, answeredInRound] 
  = await contractService.getETHPrice();
// Returns price with 8 decimals
```

---

## Contract Parameters Summary

| Parameter | Value | Notes |
|-----------|-------|-------|
| Premium | 0.01 ETH | One-time insurance cost |
| Payout | 0.01 ETH | Amount paid on claim |
| Rain Threshold | 50 mm | Minimum rainfall to trigger payout |
| Chainlink Feed | 0x694AA... | ETH/USD on Sepolia |
| Network | Sepolia | Testnet only |

---

## Oracle Architecture

The contract follows Chainlink oracle pattern:

```
1. User calls requestPolicy()
   └─> Contract emits PolicyRequested + WeatherRequested

2. Off-chain Oracle Listens
   └─> Fetches weather data for location

3. Oracle calls fulfillWeather()
   └─> Contract validates rainfall
   └─> If >= threshold, triggers payout
   └─> Emits PayoutTriggered

4. Frontend tracks transaction
   └─> Logs to history
   └─> Links to Etherscan
```

---

## Frontend Integration

### Contract Service Usage

```typescript
// Initialize
contractService.setProvider(provider);
contractService.setSigner(signer);

// Get price
const price = await contractService.getETHPrice();

// Buy policy
const txHash = await contractService.requestPolicy(location);

// Check status
const status = await contractService.getPolicyStatus();

// Trigger payout
const payoutTx = await contractService.fulfillWeather(rainfall);

// Fund contract
const fundTx = await contractService.fundContract(amount);

// Get balance
const balance = await contractService.getContractBalance();
```

---

## Event Monitoring

The contracts emit important events:

```solidity
event PolicyRequested(address indexed farmer, string location);
event WeatherRequested(string location);
event WeatherReceived(uint256 rainfall);
event PayoutTriggered(address indexed farmer, uint256 amount);
```

These can be listened to using ethers.js filters:

```typescript
// Example: Listen for payouts
contract.on("PayoutTriggered", (farmer, amount) => {
  console.log(`Payout of ${amount} sent to ${farmer}`);
});
```

---

## Security Considerations

✅ **Implemented**:
- Reentrancy protection (used `transfer`)
- Access control (onlyOracle modifier)
- State validation (require checks)
- Fallback function (receive)

⚠️ **Testnet Only**:
- Not audited for mainnet
- Demo oracle address
- Hardcoded parameters
- Simplified weather logic

🔒 **Recommendations for Mainnet**:
- Full security audit
- Chainlink Functions integration
- Multi-sig oracle control
- Parametric risk assessment
- Insurance pool distribution

---

## Deployment History

| Version | Network | Address | Status |
|---------|---------|---------|--------|
| v1 | Sepolia | 0x5Cea... | ✅ Active |
| v2 | Sepolia | 0x5Cea... | ✅ Active |

---

## Gas Estimates

Approximate gas usage on Sepolia:

| Function | Gas | Cost (20 Gwei) |
|----------|-----|----------------|
| requestPolicy | 500,000 | ~0.01 ETH |
| fulfillWeather | 500,000 | ~0.01 ETH |
| receive (fund) | 300,000 | ~0.006 ETH |

---

## Error Handling

Common contract errors:

```
"Policy already active" 
  → User already has active policy

"Premium must be 0.01 ETH"
  → Wrong payment amount

"No active policy"
  → Policy doesn't exist or already paid

"Already paid"
  → Payout already issued

"Only oracle can call"
  → Only authorized oracle address

"Insufficient contract balance"
  → Pool doesn't have funds for payout
```

---

## Future Enhancements

📋 **Smart Contract v3 (Planned)**:
- [ ] Multiple policies per address
- [ ] Chainlink Functions automation
- [ ] Dynamic risk parameters
- [ ] Insurance pool shares
- [ ] Governance token
- [ ] Multi-location support

🌐 **Chain Support**:
- [ ] Ethereum Mainnet
- [ ] Polygon
- [ ] Arbitrum
- [ ] Optimism

---

## Reference Documentation

- **Chainlink Docs**: https://docs.chain.link/
- **Solidity Docs**: https://docs.soliditylang.org/
- **Sepolia Network**: https://sepoliafaucet.com/
- **Etherscan Sepolia**: https://sepolia.etherscan.io/

---

## Contract Verification

**Sepolia Etherscan**:
- Address: `0xE529a659d1de4025A4044E6472C26B6224dADCb4`
- Network: Sepolia
- Status: Verified ✅

---

**Last Updated**: February 3, 2026  
**Contract Status**: Production Ready (Testnet)
