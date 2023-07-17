# RideSharing Contract

This Solidity contract implements a ride-sharing service on the Ethereum blockchain. It allows users to create and join rides, complete or cancel them, and handle payments using ERC20 tokens. The contract is built on the OpenZeppelin library, which provides secure and tested implementations of various Ethereum standards.

## Prerequisites

Make sure you have the following installed before using this contract:

- [Solidity Compiler](https://soliditylang.org/)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)

## Contract Details

- **SPDX-License-Identifier**: MIT
- **Solidity Version**: ^0.8.0

## Features

- Create a ride with a specified fare.
- Join an existing ride as a passenger.
- Complete a ride and distribute payments to the driver and the platform.
- Cancel a ride and refund the passengers.
- Withdraw payments as the contract owner.
- Update the fee percentage charged by the platform.

## Usage

1. Deploy the contract on the Ethereum network using a compatible Ethereum development framework (e.g., Truffle, Hardhat).

2. Pass the address of the ERC20 token contract and the fee percentage to the contract constructor.

3. Interact with the contract using the provided functions:
   - `createRide(uint256 _fare)`: Create a new ride with the specified fare.
   - `joinRide(uint256 _rideId)`: Join an existing ride as a passenger.
   - `completeRide(uint256 _rideId)`: Complete a ride as the driver and distribute payments.
   - `cancelRide(uint256 _rideId)`: Cancel a ride and refund the passengers.
   - `withdrawPayment(uint256 _amount)`: Withdraw payments as the contract owner.
   - `updateFeePercentage(uint256 _feePercentage)`: Update the fee percentage charged by the platform.
   - `getRideStatus(uint256 _rideId)`: Get the status of a specific ride.


Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

## License


