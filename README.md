# VeriMerkle - Decentralized File Integrity DApp

VeriMerkle is a premium, decentralized web application (DApp) that allows users to register file batches on the blockchain and verify their integrity later using Merkle Trees and cryptographic proofs. 

Only the **Merkle Root Hash** of a batch is stored on-chain (saving massive gas costs), while users can independently prove any file belongs to that batch with a small Merkle Proof (sibling hashes and position arrays).

## 🚀 Key Features

* **Gas-Efficient Registry**: Register multiple files simultaneously using a single 32-byte Merkle root.
* **Instant Verification**: View contract calls are free and do not require connecting a wallet, allowing anyone to verify a file instantly.
* **Proof Explorer**: Copy individual file verification payloads (leaf hashes, proofs, positions) from the UI after registration.
* **Smart Mock Mode**: Run the app out-of-the-box using a simulated in-memory blockchain, or toggle to Live Mode to connect with MetaMask.

---

## 🛠️ Tech Stack

* **Frontend**: React (TypeScript), Vite, Vanilla CSS (Glassmorphism), Lucide Icons, Canvas Confetti
* **Smart Contracts**: Solidity (0.8.24), Hardhat, Ethers.js (v6)

---

## 💻 Local Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Frontend Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run a Local Blockchain (Hardhat node)
To run a local Ethereum node for Live Mode testing:
```bash
npx hardhat node
```

### 4. Compile & Deploy the Smart Contract
In a separate terminal, deploy the Solidity contract to your local node:
```bash
# Compile contracts and generate ABIs
npm run compile

# Run the deploy script
npx hardhat run scripts/deploy.js --network localhost
```
*Note: The deploy script will save the contract address. Update `contractAddress` in `src/context/Web3Context.tsx` if it differs from the default `0x5FbDB2315678afecb367f032d93F642f64180aa3`.*

---

## ⚡ Deployment to Vercel

Vercel is the recommended hosting platform for Vite DApps. Follow these steps to host your frontend:

### 1. Prepare your Git Repository
Vercel builds your React code from source. Because the frontend imports the smart contract ABI directly, you must ensure the ABI file is committed to Git:
1. Make sure `src/artifacts` is not ignored in `.gitignore`.
2. Add the ABI file explicitly:
   ```bash
   git add -f src/artifacts/contracts/FileRegistry.sol/FileRegistry.json
   ```
3. Commit and push your code to your remote repository (e.g. GitHub).

### 2. Deploy on Vercel Dashboard
1. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Import your Git repository.
3. Vercel will auto-configure the project with these presets:
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Click **Deploy**.

### 3. Production Contract Address
If deploying to a public testnet (like Sepolia or Holesky) or Mainnet, ensure you change the `contractAddress` inside `src/context/Web3Context.tsx` to your live deployed contract address before pushing your production build.
