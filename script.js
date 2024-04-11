require("dotenv").config();
const { Web3 } = require("web3");

const JananiABI = require("./contracts/Janani.json");
const EntropyAbi = require("@pythnetwork/entropy-sdk-solidity/abis/IEntropy.json");

const entropyAddress = "0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c";
const entropyProvider = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344";
const jananiAddress = "0x90f68FF43A1dea82087885D3a3784f47206b16F1";

// Function to generate random number...

async function main() {
    const web3 = new Web3(
        "https://base-sepolia.g.alchemy.com/v2/amBmHziMqh94m4lh2y2LUesajJMTBvsn"
    );

    const { address } = web3.eth.accounts.wallet.add(
        process.env.PRIVATE_KEY
    )[0];

    web3.eth.defaultBlock = "finalized";
    const JananiContract = new web3.eth.Contract(JananiABI, jananiAddress);
    const entropyContract = new web3.eth.Contract(EntropyAbi, entropyAddress);

    const userRandomNumber = web3.utils.randomHex(32);
    const userCommitment = web3.utils.keccak256(userRandomNumber);
    console.log("userCommitment", userCommitment);

    const fee = await entropyContract.methods.getFee(entropyProvider).call();

    console.log("Fee is ", fee);
    const requestReceipt = await JananiContract.methods
        .request(userCommitment)
        .send({
            value: fee,
            from: address,
        });

    console.log(`request tx  : ${requestReceipt.transactionHash}`);
    const sequenceNumber =
        requestReceipt.events.RandomNumberRequested.returnValues.sequenceNumber;
    console.log(`sequence    : ${sequenceNumber}`);

    const info = await entropyContract.methods
        .getProviderInfo(entropyProvider)
        .call();

    const providerUri = web3.utils.hexToString(info.uri);

    // Fetch provider commitment
    const res = await fetch(`${providerUri}/revelations/${sequenceNumber}`);
    const fortunaRevelation = await res.json();

    console.log("fortunaRevelation", fortunaRevelation);

    // Fulfill the request
    const fulfillReceipt = await JananiContract.methods
        .fulfill(
            sequenceNumber,
            userRandomNumber,
            "0x" + fortunaRevelation.value.data
        )
        .send({
            from: address,
        });

    console.log(`fulfill tx  : ${fulfillReceipt.transactionHash}`);
    const generatedRandomNumber =
        fulfillReceipt.events.RandomNumberResult.returnValues.randomNumber;
    console.log(`generatedRandomNumber : ${generatedRandomNumber}`);
}
main();
