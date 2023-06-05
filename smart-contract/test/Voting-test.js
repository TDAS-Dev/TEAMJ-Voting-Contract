const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  this.timeout(0)

  let votingContract;

  it("Should deploy SimpleVoting", async function () {
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    votingContract = await SimpleVoting.deploy();
  });

  describe("Add Participants", () => {
    it("Should add a stakeholder", async () => {
      const [owner, secondAccount, thirdAccount] = await ethers.getSigners();

      const createStakeHolder = await votingContract.createStakeHolder(
        secondAccount.address,
        0
      );

      console.log("Waiting for confirmation...");
      await createStakeHolder.wait();

      votingContract.on("CreateStakeholder",(message, role)=>{
        expect(message).to.be.eq("You just created a stakeholder")
      })

      const BODList = await votingContract.getListOfBOD();
      console.log("Updated BOD list:", BODList);
      expect(BODList.length).to.be.gt(0);
    });

    it("Should add multiple stakeholders", async () => {
      const [owner, secondAccount, thirdAccount, fourthAccount] = await ethers.getSigners();

      const createStakeHolder = await votingContract.createMultipleStakeHolders(
        [thirdAccount.address, fourthAccount.address], 
        0
      );

      votingContract.on("CreateMultipleStakeHolders",(message, role)=>{
        expect(message).to.be.eq("You just created multiple stakeholders")
      })

      console.log("Waiting for confirmation...");
      await createStakeHolder.wait();

      const BODList = await votingContract.getListOfBOD();
      console.log("Updated BOD list:", BODList);
      expect(BODList.length).to.be.gt(0);;
    });

    it("Should create candidate", async () => {
      const createCandidate = await votingContract.createCandidate("winner");

      console.log("Waiting for confirmation...");
      await createCandidate.wait();

      votingContract.on("CreateCandidate",(message)=>{
        expect(message).to.be.eq("You just added a new candidate")
      })

      const candidateList = await votingContract.getListOfCandidates();
      console.log("Updated candidate list:", candidateList);
      expect(candidateList.length).to.be.gt(0);
    });

    it("Should check if is a stakeholder", async () => {
        const [secondAccount] = await ethers.getSigners();
        const isAStakeHolder = await votingContract.isAStakeholder(secondAccount.address);

      console.log("Is he a stakeholder?:", isAStakeHolder);
      expect(isAStakeHolder).to.be.true;
    });

    it("Should check if is a BOD", async () => {
        const [secondAccount] = await ethers.getSigners();
        const isAStakeHolder = await votingContract.isABOD(secondAccount.address);

      console.log("Is he a BOD?:", isAStakeHolder);
      expect(isAStakeHolder).to.be.true;
    });
  });

  describe("Toggle", () => {
    it("Should toggle voting", async () => {
      const toggleVoting = await votingContract.toggleVoting();
      
      console.log("Waiting for confirmation...");
      await toggleVoting.wait();

      const votingActive = await votingContract.getVotingState();
      console.log("Voting active:", votingActive);

      expect(votingActive).to.be.true;
    });

    it("Should toggle Result", async () => {
      const toggleResult = await votingContract.toggleResult();

      console.log("Waiting for confirmation...");
      await toggleResult.wait();

      const resultActive = await votingContract.getResultState();
      console.log("Voting active:", resultActive);

      expect(resultActive).to.be.true;
    });
  });

  describe("Transfer Chairman", () => {
    it("Should transfer chairmanship", async () => {
      const [owner, secondAccount] = await ethers.getSigners();
      const transferChairman = await votingContract.transferChairman(secondAccount.address);

      console.log("Waiting for confirmation...");
      await transferChairman.wait();

      const newChairman = await votingContract.getCurrentChairmanAddress();
      console.log("NewChairman:", newChairman);
      expect(newChairman).to.be.eq(secondAccount.address);
    });
  });

  describe("Vote", () => {
    it("Should vote successfully", async () => {
      const vote = await votingContract.vote(0);

      console.log("Waiting for confirmation...");
      await vote.wait();

      votingContract.on("Vote",(message)=>{
        expect(message).to.be.eq("You just voted a candidate")
      })

      const candidateList = await votingContract.getListOfCandidates();
      expect(candidateList[0].totalVotesReceived).to.equal(1);
    });
  });
});
