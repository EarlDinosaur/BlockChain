// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FileRegistry
 * @dev Stores Merkle roots representing batches of files to ensure document integrity.
 */
contract FileRegistry {
    // Structure to hold registry details
    struct RegistryRecord {
        uint256 timestamp;
        address author;
        string description;
    }

    // Mapping from Merkle Root to RegistryRecord
    mapping(bytes32 => RegistryRecord) public registries;

    // Events
    event RootRegistered(bytes32 indexed root, address indexed author, string description, uint256 timestamp);
    event FileVerified(bytes32 indexed root, bytes32 indexed leaf, address indexed verifier);

    /**
     * @dev Register a new Merkle Root representing a batch of files.
     * @param root The Merkle root hash.
     * @param description A brief description of the batch.
     */
    function registerRoot(bytes32 root, string memory description) public {
        require(registries[root].timestamp == 0, "Root already registered");

        registries[root] = RegistryRecord({
            timestamp: block.timestamp,
            author: msg.sender,
            description: description
        });

        emit RootRegistered(root, msg.sender, description, block.timestamp);
    }

    /**
     * @dev Check if a given Merkle root exists.
     */
    function rootExists(bytes32 root) public view returns (bool) {
        return registries[root].timestamp != 0;
    }

    /**
     * @dev Verify a file (leaf) against a registered Merkle root using its proof.
     * @param root The registered Merkle root.
     * @param leaf The hash of the file to verify.
     * @param proof The Merkle proof (array of sibling hashes).
     * @param positions The positions of the siblings (true if sibling is on the right, false if on the left).
     */
    function verifyProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[] memory proof,
        bool[] memory positions
    ) public returns (bool) {
        require(rootExists(root), "Root not registered");
        require(proof.length == positions.length, "Invalid proof format");

        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (positions[i]) {
                // Sibling is on the right
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Sibling is on the left
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        bool isValid = computedHash == root;

        if (isValid) {
            emit FileVerified(root, leaf, msg.sender);
        }

        return isValid;
    }

    /**
     * @dev Pure view function to verify a proof without emitting events (for off-chain or pure read calls)
     */
    function checkProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[] memory proof,
        bool[] memory positions
    ) public view returns (bool) {
        require(rootExists(root), "Root not registered");
        require(proof.length == positions.length, "Invalid proof format");

        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (positions[i]) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }
}
