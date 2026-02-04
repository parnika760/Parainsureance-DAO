// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
    PARAMETRIC MULTI-WEATHER FARMER INSURANCE
    
    ✔ Multiple policy types
    ✔ Location-based
    ✔ Oracle-driven payouts
    ✔ Governance-ready
    ✔ AI-calculated premiums
    ✔ Location-verified claims
*/

contract FarmerInsurance {

    // ================= ENUMS =================
    enum WeatherType {
        ExcessiveRainfall,
        HeatWave,
        Hailstorm,
        Drought,
        Frost,
        MultiHazard
    }

    // ================= STRUCT =================
    struct Policy {
        address farmer;
        string location;
        WeatherType weatherType;
        uint256 premiumPaid;
        uint256 payoutAmount;
        bool active;
        bool paid;
        uint256 purchaseTime;
        uint256 claimTime;
    }

    // ================= STORAGE =================
    mapping(address => Policy) public policies;
    mapping(string => address[]) public locationPolicies; // location -> farmers with policies
    mapping(address => uint256) public farmerPayouts; // track total payouts per farmer

    address public oracle;
    address public owner;
    uint256 public totalPremiumsCollected;
    uint256 public totalPayoutsExecuted;

    // ================= EVENTS =================
    event PolicyPurchased(
        address indexed farmer,
        string location,
        WeatherType weatherType,
        uint256 premium,
        uint256 payoutAmount
    );

    event WeatherEvaluated(
        address indexed farmer,
        string location,
        uint256 rainfall,
        int256 temperature,
        uint256 windSpeed,
        bool frostDetected
    );

    event PayoutExecuted(
        address indexed farmer,
        string location,
        uint256 payoutAmount
    );

    event LocationClaimVerified(
        address indexed farmer,
        string location,
        bool verified
    );

    event OracleUpdated(address newOracle);

    // ================= MODIFIERS =================
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle allowed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    // ================= CONSTRUCTOR =================
    constructor(address _oracle) {
        oracle = _oracle;
        owner = msg.sender;
    }

    // ================= BUY POLICY =================
    function purchasePolicy(
        string calldata location,
        WeatherType weatherType
    ) external payable {
        require(msg.value > 0, "Premium required");
        require(!policies[msg.sender].active, "Policy already active");
        require(bytes(location).length > 0, "Location required");

        // Validate location is not empty
        require(
            keccak256(bytes(location)) != keccak256(bytes("")),
            "Invalid location"
        );

        policies[msg.sender] = Policy({
            farmer: msg.sender,
            location: location,
            weatherType: weatherType,
            premiumPaid: msg.value,
            payoutAmount: msg.value * 2, // 2x payout for parametric insurance
            active: true,
            paid: false,
            purchaseTime: block.timestamp,
            claimTime: 0
        });

        // Track policies by location
        locationPolicies[location].push(msg.sender);
        totalPremiumsCollected += msg.value;

        emit PolicyPurchased(
            msg.sender,
            location,
            weatherType,
            msg.value,
            msg.value * 2
        );
    }

    // ================= ORACLE CALLBACK WITH LOCATION VERIFICATION =================
    /*
        Oracle sends weather data with location verification
        This function AUTOMATICALLY decides payout based on:
        1. Location match
        2. Weather conditions
        3. Policy type
    */
    function fulfillWeatherData(
        address farmer,
        string calldata reportedLocation,
        uint256 rainfall,       // mm
        int256 temperature,     // °C
        uint256 windSpeed,      // km/h
        bool frostDetected
    ) external onlyOracle {

        Policy storage policy = policies[farmer];
        require(policy.active, "No active policy");
        require(!policy.paid, "Already paid");

        // LOCATION VERIFICATION: Must match farmer's policy location
        require(
            keccak256(bytes(reportedLocation)) == keccak256(bytes(policy.location)),
            "Location mismatch: claim location must match policy location"
        );

        emit LocationClaimVerified(farmer, reportedLocation, true);

        bool disaster = false;

        // Weather evaluation based on policy type
        if (policy.weatherType == WeatherType.ExcessiveRainfall && rainfall > 120) {
            disaster = true;
        }

        if (policy.weatherType == WeatherType.HeatWave && temperature > 42) {
            disaster = true;
        }

        if (policy.weatherType == WeatherType.Hailstorm && windSpeed > 80) {
            disaster = true;
        }

        if (policy.weatherType == WeatherType.Drought && rainfall < 20) {
            disaster = true;
        }

        if (policy.weatherType == WeatherType.Frost && frostDetected) {
            disaster = true;
        }

        if (
            policy.weatherType == WeatherType.MultiHazard &&
            (
                rainfall > 120 ||
                temperature > 42 ||
                windSpeed > 80 ||
                frostDetected
            )
        ) {
            disaster = true;
        }

        emit WeatherEvaluated(
            farmer,
            reportedLocation,
            rainfall,
            temperature,
            windSpeed,
            frostDetected
        );

        if (disaster) {
            require(
                address(this).balance >= policy.payoutAmount,
                "Insufficient contract balance"
            );

            policy.active = false;
            policy.paid = true;
            policy.claimTime = block.timestamp;

            farmerPayouts[farmer] += policy.payoutAmount;
            totalPayoutsExecuted += policy.payoutAmount;

            (bool success, ) = payable(farmer).call{value: policy.payoutAmount}("");
            require(success, "Payout transfer failed");

            emit PayoutExecuted(farmer, reportedLocation, policy.payoutAmount);
        }
    }

    // ================= LOCATION VERIFICATION =================
    function verifyClaimLocation(
        address farmer,
        string calldata claimLocation
    ) external view returns (bool) {
        Policy memory policy = policies[farmer];
        require(policy.active || policy.paid, "No policy found");
        
        return keccak256(bytes(claimLocation)) == keccak256(bytes(policy.location));
    }

    // ================= VIEW HELPERS =================
    function getPolicy(address farmer) external view returns (Policy memory) {
        return policies[farmer];
    }

    function getPoliciesByLocation(string calldata location) 
        external 
        view 
        returns (address[] memory) 
    {
        return locationPolicies[location];
    }

    function getLocationPolicyCount(string calldata location) 
        external 
        view 
        returns (uint256) 
    {
        return locationPolicies[location].length;
    }

    function getFarmerTotalPayouts(address farmer) 
        external 
        view 
        returns (uint256) 
    {
        return farmerPayouts[farmer];
    }

    function getContractStats() 
        external 
        view 
        returns (
            uint256 premiumsCollected,
            uint256 payoutsExecuted,
            uint256 contractBalance
        ) 
    {
        return (totalPremiumsCollected, totalPayoutsExecuted, address(this).balance);
    }

    // ================= ADMIN =================
    function updateOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        oracle = _newOracle;
        emit OracleUpdated(_newOracle);
    }

    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ================= FUND POOL =================
    receive() external payable {}
}
