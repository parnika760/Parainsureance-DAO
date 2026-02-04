# ParaShield - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  PARASHIELD FRONTEND                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            React Components Layer                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Header  │  StatsOverview  │  ActionCenter  │ History│   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │            Web3Context (Global State)               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Account & Signer                                 │   │
│  │  • Provider & ChainId                               │   │
│  │  • Balance & ETH Price                              │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │           Service Layer (Business Logic)             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ContractService │ OracleService │ TransactionService│   │
│  │  • Policy Mgmt   │ • Weather Data│ • History Tracking│   │
│  │  • Price Feeds   │ • Payouts     │ • Statistics      │   │
│  │  • Balances      │ • Thresholds  │ • Persistence    │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼─────┐
   │ MetaMask │    │ Ethers  │    │ Local    │
   │ Wallet   │    │   JS    │    │ Storage  │
   └────┬────┘    └────┬────┘    └──────────┘
        │              │
        └──────────┬───┘
                   │
      ┌────────────▼──────────────────┐
      │   BLOCKCHAIN (Sepolia)        │
      ├───────────────────────────────┤
      │  Insurance Contract            │
      │  0x5Cea979df129614c09C6E7AA..  │
      │                                │
      │  • Policies Storage            │
      │  • Premium Management          │
      │  • Payout Logic                │
      │  • Oracle Integration          │
      └────────────┬───────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │  Chainlink Oracle              │
      │  ETH/USD Price Feed            │
      │  0x694AA1769357215DE4FAC...    │
      │                                │
      │  Real-time Price Data          │
      └────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Policy Purchase Flow

```
User                          UI                      Smart Contract
 │                             │                            │
 ├──> "Buy Policy"             │                            │
 │                             │                            │
 │                    ┌────────▼──────────┐                 │
 │                    │ Set Location      │                 │
 │                    │ Validate Input    │                 │
 │                    └────────┬──────────┘                 │
 │                             │                            │
 │                             ├──> requestPolicy() ──────▶│
 │                             │                            │
 │   MetaMask Prompt◀──────────│                           │
 │       (Confirm TX)          │                            │
 │   │                         │                            │
 │   └─────────────────────────┼──> (with 0.01 ETH)         │
 │                             │                            │
 │                             │      ┌─────────────────┐   │
 │                             │      │ Validate Payment│   │
 │                             │      │ Set Farm Data   │   │
 │                             │      │ Emit Event      │   │
 │                             │      └────────┬────────┘   │
 │                             │               │            │
 │                             │◀──────TX Hash──┤            │
 │                             │                            │
 │                    ┌────────▼──────────┐               │
 │                    │ Log Transaction   │               │
 │                    │ Show Confirmation │               │
 │                    └─────────────────────┘               │
 │                             │                            │
 ◀──────────────────────────────┤                            │
      "Policy Activated!"       │                            │
                                │                            │
```

### 2. Weather Check & Payout Flow

```
User                     UI                    Smart Contract
 │                        │                            │
 ├──> "Trigger Payout"   │                            │
 │                        │                            │
 │           ┌────────────▼──────────┐               │
 │           │ Check Policy Status   │               │
 │           │ (Must be active)      │               │
 │           └────────────┬──────────┘               │
 │                        │                            │
 │           ┌────────────▼──────────┐               │
 │           │ Fetch Weather Data    │               │
 │           │ (Simulate/API Call)   │               │
 │           └────────────┬──────────┘               │
 │                        │                            │
 │           ┌────────────▼──────────┐               │
 │           │ Check Rainfall        │               │
 │           │ vs Threshold (50mm)   │               │
 │           └────────────┬──────────┘               │
 │                        │                            │
 │                   ┌────┴────┐                       │
 │                   │          │                       │
 │           >= 50mm │    < 50mm│                       │
 │                   ▼          ▼                       │
 │          ┌─────────┐      ┌──────────┐            │
 │          │ fulfillWeather()            │  Show    │
 │          │ Trigger Payout  │      "No Payout"    │
 │          └────────┬────────┘      └──────────┘    │
 │                   │                            │
 │  MetaMask◀────────┤                            │
 │ (Confirm TX)      │                            │
 │  │                │                            │
 │  └────────────────┼──> (Transfer 0.01 ETH) ──▶│
 │                   │                            │
 │                   │       ┌─────────────────┐  │
 │                   │       │ Verify Rainfall │  │
 │                   │       │ Mark Paid       │  │
 │                   │       │ Send ETH        │  │
 │                   │       │ Emit Event      │  │
 │                   │       └────────┬────────┘  │
 │                   │                │           │
 │                   │◀──────TX Hash───┤           │
 │                   │                           │
 │        ┌──────────▼──────────┐               │
 │        │ Log Transaction     │               │
 │        │ Show Confirmation   │               │
 │        │ Update UI           │               │
 │        └─────────────────────┘               │
 │                   │                           │
 ◀──────────────────────┤                        │
  "Payout Triggered!"   │                        │
    0.01 ETH Received   │                        │
                        │                        │
```

### 3. Pool Funding Flow

```
User                         UI                        Smart Contract
 │                            │                            │
 ├──> "Fund Pool"            │                            │
 │    (Amount: 0.5 ETH)       │                            │
 │                            │                            │
 │               ┌────────────▼──────────┐               │
 │               │ Validate Amount       │               │
 │               │ Calculate ROI         │               │
 │               │ Show Confirmation     │               │
 │               └────────────┬──────────┘               │
 │                            │                            │
 │   MetaMask Prompt◀─────────│                            │
 │   (Confirm TX)             │                            │
 │   │                        │                            │
 │   └────────────────────────┼──> (Send 0.5 ETH)────────▶│
 │                            │                            │
 │                            │      ┌──────────────────┐  │
 │                            │      │ Accept Deposit   │  │
 │                            │      │ Update Balance   │  │
 │                            │      │ Emit Event       │  │
 │                            │      └────────┬─────────┘  │
 │                            │               │            │
 │                            │◀──────TX Hash──┤            │
 │                            │                            │
 │               ┌────────────▼──────────┐               │
 │               │ Log Transaction       │               │
 │               │ Update Pool Stats     │               │
 │               │ Show ROI Info         │               │
 │               └───────────────────────┘               │
 │                            │                            │
 ◀───────────────────────────────┤                         │
      "Pool Funded!"            │                         │
     Earning 15% APY            │                         │
                                │                         │
```

## Component Hierarchy

```
App
├── Web3Provider
│   ├── BrowserRouter
│   │   ├── Route: Dashboard
│   │   │   ├── Header
│   │   │   │   └── [Wallet Connect Button]
│   │   │   ├── StatsOverview
│   │   │   │   ├── StatsCard (ETH Price)
│   │   │   │   ├── StatsCard (Policy Status)
│   │   │   │   └── StatsCard (Pool Liquidity)
│   │   │   ├── ActionCenter
│   │   │   │   ├── [Buy Policy Section]
│   │   │   │   ├── [Weather Check Section]
│   │   │   │   └── [Fund Pool Section]
│   │   │   └── TransactionHistory
│   │   │       └── [Transaction List]
│   │   └── Route: Policies
│   │       └── [Policy Details Page]
```

## Service Layer Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │             ContractService                          │  │
│ │                                                       │  │
│ │  ├─ setSigner(signer)                               │  │
│ │  ├─ setProvider(provider)                           │  │
│ │  ├─ getETHPrice()                                   │  │
│ │  ├─ requestPolicy(location)                         │  │
│ │  ├─ getPolicyStatus()                               │  │
│ │  ├─ getContractBalance()                            │  │
│ │  ├─ fundContract(amount)                            │  │
│ │  ├─ fulfillWeather(rainfall)                        │  │
│ │  └─ getRainThreshold()                              │  │
│ │                                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │             OracleService                            │  │
│ │                                                       │  │
│ │  ├─ fetchWeatherData(location)                      │  │
│ │  ├─ storeWeatherData(location, data)                │  │
│ │  ├─ getWeatherHistory(location)                     │  │
│ │  ├─ formatOracleResponse(weatherData)               │  │
│ │  └─ shouldTriggerPayout(rainfall, threshold)        │  │
│ │                                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │             TransactionService                       │  │
│ │                                                       │  │
│ │  ├─ logTransaction(log)                             │  │
│ │  ├─ getTransactions()                               │  │
│ │  ├─ getTransactionsByType(type)                     │  │
│ │  ├─ updateTransactionStatus(id, status)             │  │
│ │  ├─ clearHistory()                                  │  │
│ │  ├─ loadFromStorage()                               │  │
│ │  ├─ saveToStorage()                                 │  │
│ │  └─ getStatistics()                                 │  │
│ │                                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Data Models

```
┌──────────────────────────────────────┐
│          Policy Data                  │
├──────────────────────────────────────┤
│ farmer: address                       │
│ policyActive: boolean                 │
│ policyPaid: boolean                   │
│ farmLocation: string                  │
│ lastReportedRainfall: number          │
│ premiumAmount: string (ETH)           │
│ payoutAmount: string (ETH)            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│          Weather Data                 │
├──────────────────────────────────────┤
│ location: string                      │
│ rainfall: number (mm)                 │
│ timestamp: number                     │
│ humidity: number (optional)           │
│ temperature: number (optional)        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│        Transaction Log                │
├──────────────────────────────────────┤
│ id: string (unique)                   │
│ type: 'PolicyBought'|'PayoutTriggered'│
│        |'WeatherReported'|'FundsDeposited'
│ timestamp: number                     │
│ status: 'pending'|'confirmed'|'failed'│
│ amount: string (optional)             │
│ txHash: string (optional)             │
│ description: string                   │
└──────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────┐
│       Web3Context State                  │
├─────────────────────────────────────────┤
│                                          │
│  account ──────────────────────────────┐ │
│  │ On Connect: Set from MetaMask        │ │
│  │ On Disconnect: Clear                 │ │
│  │ Updates on account change events     │ │
│  │                                       │ │
│  provider ────────────────────────────┐ │
│  │ On Connect: Initialize BrowserProvider│
│  │ Used for read-only operations        │ │
│  │                                       │ │
│  signer ──────────────────────────────┐ │
│  │ On Connect: Get from provider        │ │
│  │ Used for signing transactions        │ │
│  │                                       │ │
│  balance ─────────────────────────────┐ │
│  │ Fetch on connect                     │ │
│  │ Refresh every 30 seconds             │ │
│  │ Decimal formatted string             │ │
│  │                                       │ │
│  ethPrice ────────────────────────────┐ │
│  │ Fetch from Chainlink on connect      │ │
│  │ Refresh every 30 seconds             │ │
│  │ USD decimal value                    │ │
│  │                                       │ │
│  chainId ─────────────────────────────┐ │
│  │ Set on connect (11155111 = Sepolia)  │ │
│  │ Used for network validation          │ │
│  │                                       │ │
│  isConnected ──────────────────────────┐│
│  │ Derived from !!account               ││
│  │ Used for UI conditional rendering    ││
│                                          │
└─────────────────────────────────────────┘
```

## Event Flow

```
User Action                    Component          Service              Contract
     │                            │                  │                    │
     ├─> Click "Buy Policy"       │                  │                    │
     │                            │                  │                    │
     │                    ┌─────────▼────────┐      │                    │
     │                    │ Get Location     │      │                    │
     │                    │ Validate Input   │      │                    │
     │                    └─────────┬────────┘      │                    │
     │                            │                  │                    │
     │                            ├────> call requestPolicy()────────────▶│
     │                            │      with 0.01 ETH                   │
     │                            │                  │                    │
     │   MetaMask◀────────────────┤                  │                    │
     │   Transaction│             │                  │                    │
     │   Prompt     │             │                  │                    │
     │              └─────────────────────────────▶│ Execute             │
     │                            │                  │ + Emit Event       │
     │                            │                  │◀────TX Hash────────┤
     │                            │◀────────────────┤                    │
     │                            │                  │                    │
     │                    ┌─────────▼────────┐       │                    │
     │                    │ Log Transaction  │       │                    │
     │                    │ Update UI        │       │                    │
     │                    │ Show Confirmation│       │                    │
     │                    └──────────────────┘       │                    │
     │                             |                 │                    │
     └─────────────────────────────┘                 │                    │
          "Policy Purchased!"                        │                    │
                                                     │                    │
```

## Database/Storage Model

```
┌─────────────────────────────────────────────────────┐
│         Local Storage (Persistent)                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ localStorage.insurance_transactions = JSON.stringify([
│   {
│     id: "tx_1234567890_abc123",
│     type: "PolicyBought",
│     timestamp: 1706867400000,
│     status: "confirmed",
│     amount: "0.01",
│     txHash: "0x123...",
│     description: "Policy purchase for My Farm"
│   },
│   ... more transactions
│ ])
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Memory State (Volatile)                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Web3Context:
│   - account: "0x123..."
│   - provider: BrowserProvider
│   - signer: JsonRpcSigner
│   - balance: "0.5"
│   - ethPrice: 2350
│                                                      │
│ Component States:
│   - policyActive: boolean
│   - contractBalance: string
│   - transactions: TransactionLog[]
│   - weatherData: WeatherData
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

This architecture provides a clean separation of concerns with services handling blockchain interactions, components managing UI, and Web3Context managing global state.
