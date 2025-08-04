# TwinTrust

A decentralized digital twin management platform that empowers industries to securely create, track, and manage the lifecycle of physical assets through their digital counterparts — all on-chain using Clarity smart contracts.

---

## Overview

TwinTrust consists of ten smart contracts that work together to ensure secure, traceable, and interoperable digital twin lifecycle management for manufacturers, asset owners, inspectors, and service providers:

1. **Twin Registry Contract** – Registers digital twins with metadata and ownership.
2. **Access Control Contract** – Manages role-based permissions for stakeholders.
3. **Lifecycle Manager Contract** – Tracks lifecycle states of each twin.
4. **Component NFT Contract** – Represents physical components as transferable NFTs.
5. **Maintenance Log Contract** – Stores immutable maintenance logs and audit entries.
6. **Audit Trail Contract** – Records a history of actions/events for each twin.
7. **Marketplace Contract** – Enables buying, selling, and licensing of twins and components.
8. **Insurance Contract** – Automates claims using real-world sensor data.
9. **Incentive Contract** – Rewards contributors for validated actions and data.
10. **DAO Governance Contract** – Allows stakeholder voting on platform rules and upgrades.

---

## Features

- **Tamper-proof registration** of digital twins  
- **Granular access control** for authorized parties  
- **On-chain lifecycle tracking** of physical assets  
- **Component-level NFTs** for modular asset upgrades  
- **Immutable maintenance history** for compliance  
- **Event logging** for audits and legal traceability  
- **Asset and IP marketplace** with secure licensing  
- **Sensor-based insurance automation**  
- **Contribution incentives** to encourage accurate reporting  
- **Decentralized governance** via DAO proposals  

---

## Smart Contracts

### Twin Registry Contract
- Register new digital twins with metadata and unique IDs
- Store IPFS hashes of off-chain twin models
- Link twins to owners and asset types

### Access Control Contract
- Define and manage stakeholder roles (Owner, OEM, Inspector, Maintainer)
- Grant or revoke access rights
- Restrict contract interaction by role

### Lifecycle Manager Contract
- Enforce valid state transitions (Commissioned → Operational → Maintenance → Decommissioned)
- Record timestamps and trigger alerts

### Component NFT Contract
- Mint NFTs for replaceable asset parts (e.g., motors, sensors)
- Allow swaps, upgrades, and resale
- Track ownership and configuration

### Maintenance Log Contract
- Log hash-verified maintenance reports
- Validate submitter roles
- Timestamp and store off-chain record links

### Audit Trail Contract
- Chronicle asset lifecycle events (ownership, updates, inspections)
- Enable compliance-ready historical reports
- Tamper-proof event hashing

### Marketplace Contract
- List digital twins or components for sale/licensing
- Handle payments and escrow
- Transfer ownership post-settlement

### Insurance Contract
- Trigger claim evaluation from sensor/oracle data
- Automate payout logic based on twin states
- Link with external insurers or DAOs

### Incentive Contract
- Distribute ERC-20 tokens for verified contributions
- Gamify reporting, inspections, and updates
- Slash rewards for fraudulent or failed actions

### DAO Governance Contract
- Create and vote on proposals (e.g., platform changes, standards)
- Use twin-based tokens for weighted voting
- Enforce quorum and delay rules

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/twintrust.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

---

## Usage

Each contract is modular and composable. Begin by registering a digital twin, assign stakeholders, track lifecycle changes, log activity, and monetize or insure your asset — all using Clarity smart contracts and on-chain storage. Detailed contract-level documentation is available in the /contracts directory.

---

## License

MIT License