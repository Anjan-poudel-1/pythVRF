// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
 
contract CoinFlip {
  event RandomNumberRequested(uint64 sequenceNumber);
  event RandomNumberResult(uint256 randomNumber);
 
  IEntropy entropy;
  address provider;
  uint64 public generatedsequenceNumber;
  uint128 public generatedrequestFee;
  uint256 public generatedRandomNumber;

 

//  	0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c
// provider => 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344
  constructor(address _entropy, address _provider) {
    entropy = IEntropy(_entropy);
    provider = _provider;
  }
uint256 public maxSupply = 8848;
   function request(bytes32 userCommitment) external payable {
    // checks
    uint128 requestFee = entropy.getFee(provider);
    generatedrequestFee = requestFee;
    // if(msg.value < requestFee) revert("not enough fees");
 
    // pay the fees and request a random number from entropy
    uint64 sequenceNumber = entropy.request{value: requestFee}(provider, userCommitment, true);
 generatedsequenceNumber = sequenceNumber;
    // emit event
    emit RandomNumberRequested(sequenceNumber);
  }


  function fulfill(uint64 sequenceNumber, bytes32 userRandomness, bytes32 providerRevelation) external {
    bytes32 randomNumber = entropy.reveal(provider, sequenceNumber, userRandomness, providerRevelation);
    generatedRandomNumber = uint256(randomNumber) % maxSupply;

    emit RandomNumberResult(generatedRandomNumber);
  }

}
 