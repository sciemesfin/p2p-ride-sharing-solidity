// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RideSharing is Ownable {
    using SafeMath for uint256;

    enum RideStatus { Created, Joined, Completed, Canceled }

    struct Ride {
        uint256 id;
        address driver;
        uint256 fare;
        uint256 balance;
        RideStatus status;
        mapping(address => bool) passengers;
    }

    mapping(uint256 => Ride) private rides;
    uint256 private rideCount;

    IERC20 private paymentToken;
    uint256 private feePercentage;

    event RideEvent(uint256 indexed id, address indexed participant, string eventType);
    event PaymentWithdrawn(address indexed payee, uint256 amount);

    constructor(address _paymentToken, uint256 _feePercentage) {
        require(_feePercentage <= 100, "RideSharing: Fee percentage cannot exceed 100");
        paymentToken = IERC20(_paymentToken);
        feePercentage = _feePercentage;
    }

    modifier rideExists(uint256 _rideId) {
        require(rides[_rideId].id != 0, "RideSharing: Ride does not exist");
        _;
    }

    function createRide(uint256 _fare) external {
        rideCount++;
        Ride storage ride = rides[rideCount];
        ride.id = rideCount;
        ride.driver = msg.sender;
        ride.fare = _fare;
        ride.balance = _fare;
        ride.status = RideStatus.Created;
        emit RideEvent(rideCount, msg.sender, "Created");
    }

    function joinRide(uint256 _rideId) external rideExists(_rideId) {
        Ride storage ride = rides[_rideId];
        require(ride.status == RideStatus.Created, "RideSharing: Ride has already started or ended");
        require(!ride.passengers[msg.sender], "RideSharing: Passenger has already joined");

        ride.passengers[msg.sender] = true;
        ride.balance = ride.balance.add(ride.fare);
        emit RideEvent(_rideId, msg.sender, "Joined");
    }

    function completeRide(uint256 _rideId) external rideExists(_rideId) {
        Ride storage ride = rides[_rideId];
        require(ride.status == RideStatus.Created, "RideSharing: Ride has already started or ended");
        require(ride.driver == msg.sender, "RideSharing: Only the driver can complete the ride");

        ride.status = RideStatus.Completed;
        uint256 fee = ride.fare.mul(feePercentage).div(100);
        uint256 payment = ride.balance.sub(fee);

        paymentToken.transfer(msg.sender, payment);
        paymentToken.transfer(owner(), fee);
        emit RideEvent(_rideId, msg.sender, "Completed");
    }

    function cancelRide(uint256 _rideId) external rideExists(_rideId) {
        Ride storage ride = rides[_rideId];
        require(ride.status == RideStatus.Created, "RideSharing: Ride has already started or ended");
        require(ride.driver != msg.sender, "RideSharing: Drivers cannot cancel the ride");

        ride.status = RideStatus.Canceled;
        paymentToken.transfer(msg.sender, ride.balance);
        emit RideEvent(_rideId, msg.sender, "Canceled");
    }

    function withdrawPayment(uint256 _amount) external onlyOwner {
        paymentToken.transfer(owner(), _amount);
        emit PaymentWithdrawn(owner(), _amount);
    }

    function updateFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 100, "RideSharing: Fee percentage cannot exceed 100");
        feePercentage = _feePercentage;
    }

    function getRideStatus(uint256 _rideId) external view returns (RideStatus) {
        require(rides[_rideId].id != 0, "RideSharing: Ride does not exist");
        return rides[_rideId].status;
    }
}
