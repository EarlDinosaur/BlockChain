const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileRegistry", function () {
  async function deployFileRegistryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const FileRegistry = await ethers.getContractFactory("FileRegistry");
    const fileRegistry = await FileRegistry.deploy();
    return { fileRegistry, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { fileRegistry } = await deployFileRegistryFixture();
      expect(fileRegistry.target).to.be.properAddress;
    });
  });

  describe("Registration", function () {
    it("Should register a new root and emit event", async function () {
      const { fileRegistry, owner } = await deployFileRegistryFixture();
      const root = ethers.keccak256(ethers.toUtf8Bytes("dummy_root"));
      
      await expect(fileRegistry.registerRoot(root, "Test batch"))
        .to.emit(fileRegistry, "RootRegistered")
        .withArgs(root, owner.address, "Test batch", (anyValue) => true);

      expect(await fileRegistry.rootExists(root)).to.be.true;
    });

    it("Should fail to register duplicate root", async function () {
      const { fileRegistry } = await deployFileRegistryFixture();
      const root = ethers.keccak256(ethers.toUtf8Bytes("dummy_root"));
      
      await fileRegistry.registerRoot(root, "Test batch");
      await expect(fileRegistry.registerRoot(root, "Duplicate")).to.be.revertedWith("Root already registered");
    });
  });

  describe("Verification", function () {
    it("Should verify a valid merkle proof", async function () {
      const { fileRegistry } = await deployFileRegistryFixture();
      
      const leafA = ethers.keccak256(ethers.toUtf8Bytes("FileA"));
      const leafB = ethers.keccak256(ethers.toUtf8Bytes("FileB"));
      
      const root = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [leafA, leafB]);

      await fileRegistry.registerRoot(root, "2 files");

      const proof = [leafB];
      const positions = [true];

      const isValid = await fileRegistry.checkProof(root, leafA, proof, positions);
      expect(isValid).to.be.true;
    });

    it("Should reject an invalid merkle proof", async function () {
      const { fileRegistry } = await deployFileRegistryFixture();
      
      const leafA = ethers.keccak256(ethers.toUtf8Bytes("FileA"));
      const leafB = ethers.keccak256(ethers.toUtf8Bytes("FileB"));
      const leafC = ethers.keccak256(ethers.toUtf8Bytes("FileC"));
      
      const root = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [leafA, leafB]);

      await fileRegistry.registerRoot(root, "2 files");

      const proof = [leafC];
      const positions = [true];

      const isValid = await fileRegistry.checkProof(root, leafA, proof, positions);
      expect(isValid).to.be.false;
    });
  });
});
