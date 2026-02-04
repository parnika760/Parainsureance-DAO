// Example Test Cases for Farmer Insurance System
// Use these with Hardhat, Truffle, or your preferred testing framework

import { expect } from "chai";
import { ethers } from "hardhat";
import { FarmerInsurance } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FarmerInsurance", function () {
  let insurance: FarmerInsurance;
  let owner: SignerWithAddress;
  let farmer1: SignerWithAddress;
  let farmer2: SignerWithAddress;
  let oracle: SignerWithAddress;

  beforeEach(async function () {
    [owner, farmer1, farmer2, oracle] = await ethers.getSigners();

    const FarmerInsurance = await ethers.getContractFactory("FarmerInsurance");
    insurance = await FarmerInsurance.deploy(oracle.address);
    await insurance.waitForDeployment();
  });

  describe("Policy Purchase", function () {
    it("Should allow farmer to purchase policy", async function () {
      const premium = ethers.parseEther("0.5");

      const tx = await insurance.connect(farmer1).purchasePolicy(
        "India - Punjab",
        3, // Drought
        { value: premium }
      );

      await expect(tx).to.emit(insurance, "PolicyPurchased");

      const policy = await insurance.getPolicy(farmer1.address);
      expect(policy.farmer).to.equal(farmer1.address);
      expect(policy.location).to.equal("India - Punjab");
      expect(policy.weatherType).to.equal(3);
      expect(policy.premiumPaid).to.equal(premium);
      expect(policy.active).to.be.true;
      expect(policy.paid).to.be.false;
    });

    it("Should calculate correct payout (2x premium)", async function () {
      const premium = ethers.parseEther("0.5");

      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      const policy = await insurance.getPolicy(farmer1.address);
      expect(policy.payoutAmount).to.equal(premium * 2n);
    });

    it("Should prevent duplicate active policies", async function () {
      const premium = ethers.parseEther("0.5");

      // First policy
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      // Try to buy another policy while first is active
      await expect(
        insurance
          .connect(farmer1)
          .purchasePolicy("US - Midwest", 2, { value: premium })
      ).to.be.revertedWith("Policy already active");
    });

    it("Should reject policy with empty location", async function () {
      const premium = ethers.parseEther("0.5");

      await expect(
        insurance
          .connect(farmer1)
          .purchasePolicy("", 3, { value: premium })
      ).to.be.revertedWith("Location required");
    });

    it("Should reject policy with zero premium", async function () {
      await expect(
        insurance
          .connect(farmer1)
          .purchasePolicy("India - Punjab", 3, { value: 0 })
      ).to.be.revertedWith("Premium required");
    });

    it("Should track policies by location", async function () {
      const premium = ethers.parseEther("0.5");

      // Two farmers buy policy for same location
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      // Different farmer would need different account
      // Since we have farmer2, they can buy for same location
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      const policies = await insurance.getPoliciesByLocation("India - Punjab");
      expect(policies.length).to.equal(2);
      expect(policies[0]).to.equal(farmer1.address);
      expect(policies[1]).to.equal(farmer2.address);
    });

    it("Should update purchase time", async function () {
      const premium = ethers.parseEther("0.5");
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const blockTime = block?.timestamp || 0;

      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      const policy = await insurance.getPolicy(farmer1.address);
      expect(policy.purchaseTime).to.be.closeTo(blockTime, 5); // Allow 5 sec variance
    });
  });

  describe("Location Verification", function () {
    beforeEach(async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });
    });

    it("Should verify matching location", async function () {
      const isVerified = await insurance.verifyClaimLocation(
        farmer1.address,
        "India - Punjab"
      );
      expect(isVerified).to.be.true;
    });

    it("Should reject mismatched location", async function () {
      const isVerified = await insurance.verifyClaimLocation(
        farmer1.address,
        "India - Maharashtra"
      );
      expect(isVerified).to.be.false;
    });

    it("Should reject claim with wrong location (case-sensitive)", async function () {
      const isVerified = await insurance.verifyClaimLocation(
        farmer1.address,
        "india - punjab" // lowercase
      );
      expect(isVerified).to.be.false;
    });
  });

  describe("Weather Data & Payouts", function () {
    beforeEach(async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      // Fund contract for payouts
      await owner.sendTransaction({
        to: await insurance.getAddress(),
        value: ethers.parseEther("10"),
      });
    });

    it("Should reject weather data from non-oracle", async function () {
      await expect(
        insurance
          .connect(farmer1)
          .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false)
      ).to.be.revertedWith("Only oracle allowed");
    });

    it("Should reject claim with mismatched location", async function () {
      await expect(
        insurance
          .connect(oracle)
          .fulfillWeatherData(farmer1.address, "India - Maharashtra", 10, 35, 50, false)
      ).to.be.revertedWith("Location mismatch");
    });

    it("Should trigger payout for drought (rainfall < 20mm)", async function () {
      const policy = await insurance.getPolicy(farmer1.address);
      const farmer1BalanceBefore = await ethers.provider.getBalance(farmer1.address);

      // Trigger drought
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false);

      const policy2 = await insurance.getPolicy(farmer1.address);
      expect(policy2.paid).to.be.true;

      const farmer1BalanceAfter = await ethers.provider.getBalance(farmer1.address);
      expect(farmer1BalanceAfter).to.equal(
        farmer1BalanceBefore + policy.payoutAmount
      );
    });

    it("Should not payout for normal rainfall (drought coverage)", async function () {
      const policy = await insurance.getPolicy(farmer1.address);

      // Normal rainfall (above drought threshold)
      await insurance
        .connect(oracle)
        .fulfillWeatherData(
          farmer1.address,
          "India - Punjab",
          50, // 50mm - above 20mm threshold
          35,
          50,
          false
        );

      const policy2 = await insurance.getPolicy(farmer1.address);
      expect(policy2.paid).to.be.false; // No payout
      expect(policy2.active).to.be.true; // Policy still active
    });

    it("Should handle Excessive Rainfall trigger (> 120mm)", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 0, { value: premium }); // ExcessiveRainfall

      const policyBefore = await insurance.getPolicy(farmer2.address);
      expect(policyBefore.active).to.be.true;

      // Trigger excessive rainfall
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer2.address, "India - Punjab", 150, 25, 50, false);

      const policyAfter = await insurance.getPolicy(farmer2.address);
      expect(policyAfter.paid).to.be.true;
    });

    it("Should handle Heat Wave trigger (> 42°C)", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 1, { value: premium }); // HeatWave

      // Trigger heat wave
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer2.address, "India - Punjab", 50, 45, 30, false);

      const policy = await insurance.getPolicy(farmer2.address);
      expect(policy.paid).to.be.true;
    });

    it("Should handle Hailstorm trigger (windSpeed > 80km/h)", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 2, { value: premium }); // Hailstorm

      // Trigger hailstorm
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer2.address, "India - Punjab", 50, 25, 90, false);

      const policy = await insurance.getPolicy(farmer2.address);
      expect(policy.paid).to.be.true;
    });

    it("Should handle Frost trigger (frostDetected = true)", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 4, { value: premium }); // Frost

      // Trigger frost
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer2.address, "India - Punjab", 50, -2, 20, true);

      const policy = await insurance.getPolicy(farmer2.address);
      expect(policy.paid).to.be.true;
    });

    it("Should handle Multi-Hazard trigger (any condition met)", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer2)
        .purchasePolicy("India - Punjab", 5, { value: premium }); // MultiHazard

      // Trigger any single condition
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer2.address, "India - Punjab", 10, 25, 50, false);

      const policy = await insurance.getPolicy(farmer2.address);
      expect(policy.paid).to.be.true;
    });

    it("Should prevent double payout", async function () {
      const policy = await insurance.getPolicy(farmer1.address);
      const payout = policy.payoutAmount;

      // First claim - should work
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false);

      // Try to claim again - should fail
      await expect(
        insurance
          .connect(oracle)
          .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false)
      ).to.be.revertedWith("Already paid");
    });

    it("Should record claim time", async function () {
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const blockTime = block?.timestamp || 0;

      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false);

      const policy = await insurance.getPolicy(farmer1.address);
      expect(policy.claimTime).to.be.closeTo(blockTime, 5);
    });
  });

  describe("Contract Statistics", function () {
    it("Should track total premiums collected", async function () {
      const premium = ethers.parseEther("0.5");

      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });
      await insurance
        .connect(farmer2)
        .purchasePolicy("US - Midwest", 2, { value: premium });

      const stats = await insurance.getContractStats();
      expect(stats.premiumsCollected).to.equal(premium * 2n);
    });

    it("Should track total payouts executed", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      // Fund contract
      await owner.sendTransaction({
        to: await insurance.getAddress(),
        value: ethers.parseEther("10"),
      });

      // Trigger payout
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false);

      const stats = await insurance.getContractStats();
      expect(stats.payoutsExecuted).to.equal(premium * 2n); // 2x payout
    });

    it("Should track farmer total payouts", async function () {
      const premium = ethers.parseEther("0.5");
      await insurance
        .connect(farmer1)
        .purchasePolicy("India - Punjab", 3, { value: premium });

      // Fund contract
      await owner.sendTransaction({
        to: await insurance.getAddress(),
        value: ethers.parseEther("10"),
      });

      // Trigger payout
      await insurance
        .connect(oracle)
        .fulfillWeatherData(farmer1.address, "India - Punjab", 10, 35, 50, false);

      const totalPayouts = await insurance.getFarmerTotalPayouts(farmer1.address);
      expect(totalPayouts).to.equal(premium * 2n);
    });

    it("Should track contract balance", async function () {
      const fundAmount = ethers.parseEther("5");
      await owner.sendTransaction({
        to: await insurance.getAddress(),
        value: fundAmount,
      });

      const stats = await insurance.getContractStats();
      expect(stats.contractBalance).to.equal(fundAmount);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update oracle", async function () {
      const newOracle = farmer1;

      await expect(insurance.connect(owner).updateOracle(newOracle.address))
        .to.emit(insurance, "OracleUpdated")
        .withArgs(newOracle.address);

      expect(await insurance.oracle()).to.equal(newOracle.address);
    });

    it("Should prevent non-owner from updating oracle", async function () {
      await expect(
        insurance.connect(farmer1).updateOracle(farmer2.address)
      ).to.be.revertedWith("Only owner allowed");
    });

    it("Should reject invalid oracle address", async function () {
      await expect(
        insurance.connect(owner).updateOracle(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });

    it("Should allow owner to withdraw contract balance", async function () {
      const fundAmount = ethers.parseEther("5");
      await owner.sendTransaction({
        to: await insurance.getAddress(),
        value: fundAmount,
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await insurance.connect(owner).withdrawContractBalance();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // Balance increased by fund amount minus gas costs
      expect(ownerBalanceAfter).to.be.closeTo(
        ownerBalanceBefore + fundAmount - gasUsed,
        ethers.parseEther("0.01")
      );
    });
  });
});
