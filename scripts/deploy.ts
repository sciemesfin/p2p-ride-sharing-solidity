// File: scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const RideSharing = await ethers.getContractFactory("RideSharing");
  console.log("Deploying RideSharing contract...");
  const rideSharing = await RideSharing.deploy();
  await rideSharing.deployed();
  console.log("RideSharing contract deployed to:", rideSharing.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
