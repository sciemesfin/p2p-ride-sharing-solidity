// Import the necessary packages
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('RideSharing', function () {
  let rideSharingContract:any;
  let paymentToken:any;
  let owner:any;
  let passenger:any;
  let nonParticipant:any;


  beforeEach(async function () {
    // Deploy the RideSharing contract
    const RideSharing = await ethers.getContractFactory('RideSharing');
    rideSharingContract = await RideSharing.deploy(
      '0x778d819d66925b6e8676195eea5a43b2febe1658',
      10,
    );
    await rideSharingContract.deployed();

    // Deploy a mock payment token contract
    const MockPaymentToken = await ethers.getContractFactory('MockPaymentToken');
    paymentToken = await MockPaymentToken.deploy();
    await paymentToken.deployed();

    // Get the contract owner and two additional accounts
    [owner, passenger, nonParticipant] = await ethers.getSigners();

    // Transfer some payment tokens to the contract owner
    await paymentToken.transfer(owner.address, ethers.parseEther('100'));
  });

  it('should create a ride', async function () {
    const fare = ethers.parseEther('1');

    await rideSharingContract.connect(owner).createRide(fare);

    const rideStatus = await rideSharingContract.getRideStatus(1);

    expect(rideStatus).to.equal(0); // RideStatus.Created
  });

  it('should allow a passenger to join a ride', async function () {
    const fare = ethers.parseEther('1');

    await rideSharingContract.connect(owner).createRide(fare);

    await rideSharingContract.connect(passenger).joinRide(1);

    const rideStatus = await rideSharingContract.getRideStatus(1);

    expect(rideStatus).to.equal(1); // RideStatus.Joined
  });

  it('should complete a ride and distribute payment', async function () {
    const fare = ethers.parseEther('1');
    const feePercentage = 10;
    const fee = fare * BigInt(feePercentage) / BigInt(100);
    const payment = fare - fee;

    await rideSharingContract.connect(owner).createRide(fare);
    await rideSharingContract.connect(passenger).joinRide(1);

    await rideSharingContract.connect(owner).completeRide(1);

    const rideStatus = await rideSharingContract.getRideStatus(1);
    const ownerBalance = await paymentToken.balanceOf(owner.address);
    const passengerBalance = await paymentToken.balanceOf(passenger.address);

    expect(rideStatus).to.equal(2); // RideStatus.Completed
    expect(ownerBalance).to.equal(payment); // Owner receives the payment
    expect(passengerBalance).to.equal(0); // Passenger receives nothing
  });

  it('should cancel a ride and refund the passenger', async function () {
    const fare = ethers.parseEther('1');

    await rideSharingContract.connect(owner).createRide(fare);
    await rideSharingContract.connect(passenger).joinRide(1);

    await rideSharingContract.connect(nonParticipant).cancelRide(1);

    const rideStatus = await rideSharingContract.getRideStatus(1);
    const passengerBalance = await paymentToken.balanceOf(passenger.address);

    expect(rideStatus).to.equal(3); // RideStatus.Canceled
    expect(passengerBalance).to.equal(fare); // Passenger receives a refund
  });

  it('should allow the owner to withdraw payment', async function () {
    const withdrawalAmount = ethers.parseEther('10');

    await rideSharingContract.withdrawPayment(withdrawalAmount);

    const ownerBalance = await paymentToken.balanceOf(owner.address);

    expect(ownerBalance).to.equal(withdrawalAmount); // Owner's balance increases
  });

  it('should update the fee percentage', async function () {
    const newFeePercentage = 20;

    await rideSharingContract.updateFeePercentage(newFeePercentage);

    const feePercentage = await rideSharingContract.feePercentage();

    expect(feePercentage).to.equal(newFeePercentage); // Fee percentage is updated
  });
});
