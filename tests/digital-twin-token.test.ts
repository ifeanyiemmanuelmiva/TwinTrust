import { describe, it, expect, beforeEach } from "vitest"

type Principal = string

interface TwinTrustContract {
  admin: Principal
  paused: boolean
  totalSupply: bigint
  balances: Map<Principal, bigint>
  staked: Map<Principal, bigint>
  twinOwners: Map<number, Principal>
  twinStatus: Map<number, string>
  twinIPFS: Map<number, string>
  twinCounter: number
  MAX_SUPPLY: bigint

  isAdmin(caller: Principal): boolean
  setPaused(caller: Principal, pause: boolean): { value?: boolean; error?: number }
  mint(caller: Principal, recipient: Principal, amount: bigint): { value?: boolean; error?: number }
  transfer(caller: Principal, recipient: Principal, amount: bigint): { value?: boolean; error?: number }
  stake(caller: Principal, amount: bigint): { value?: boolean; error?: number }
  unstake(caller: Principal, amount: bigint): { value?: boolean; error?: number }
  registerTwin(caller: Principal, ipfsHash: string): { value?: number; error?: number }
  updateTwinStatus(caller: Principal, twinId: number, newStatus: string): { value?: boolean; error?: number }
}

const mockContract: TwinTrustContract = {
  admin: "ST1ADMIN",
  paused: false,
  totalSupply: 0n,
  balances: new Map(),
  staked: new Map(),
  twinOwners: new Map(),
  twinStatus: new Map(),
  twinIPFS: new Map(),
  twinCounter: 0,
  MAX_SUPPLY: 500_000_000n,

  isAdmin(caller) {
    return caller === this.admin
  },

  setPaused(caller, pause) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.paused = pause
    return { value: pause }
  },

  mint(caller, recipient, amount) {
    if (!this.isAdmin(caller)) return { error: 100 }
    if (recipient === "SP000000000000000000002Q6VF78") return { error: 105 }
    if (this.totalSupply + amount > this.MAX_SUPPLY) return { error: 103 }
    this.balances.set(recipient, (this.balances.get(recipient) || 0n) + amount)
    this.totalSupply += amount
    return { value: true }
  },

  transfer(caller, recipient, amount) {
    if (this.paused) return { error: 104 }
    if (recipient === "SP000000000000000000002Q6VF78") return { error: 105 }
    const bal = this.balances.get(caller) || 0n
    if (bal < amount) return { error: 101 }
    this.balances.set(caller, bal - amount)
    this.balances.set(recipient, (this.balances.get(recipient) || 0n) + amount)
    return { value: true }
  },

  stake(caller, amount) {
    if (this.paused) return { error: 104 }
    const bal = this.balances.get(caller) || 0n
    if (bal < amount) return { error: 101 }
    this.balances.set(caller, bal - amount)
    this.staked.set(caller, (this.staked.get(caller) || 0n) + amount)
    return { value: true }
  },

  unstake(caller, amount) {
    if (this.paused) return { error: 104 }
    const staked = this.staked.get(caller) || 0n
    if (staked < amount) return { error: 102 }
    this.staked.set(caller, staked - amount)
    this.balances.set(caller, (this.balances.get(caller) || 0n) + amount)
    return { value: true }
  },

  registerTwin(caller, ipfsHash) {
    if (this.paused) return { error: 104 }
    const newId = ++this.twinCounter
    this.twinOwners.set(newId, caller)
    this.twinIPFS.set(newId, ipfsHash)
    this.twinStatus.set(newId, "commissioned")
    return { value: newId }
  },

  updateTwinStatus(caller, twinId, newStatus) {
    if (this.paused) return { error: 104 }
    if (this.twinOwners.get(twinId) !== caller) return { error: 106 }
    this.twinStatus.set(twinId, newStatus)
    return { value: true }
  }
}

describe("TwinTrust Contract", () => {
  const user1 = "ST1USER1"
  const user2 = "ST2USER2"

  beforeEach(() => {
    mockContract.admin = "ST1ADMIN"
    mockContract.paused = false
    mockContract.totalSupply = 0n
    mockContract.balances = new Map()
    mockContract.staked = new Map()
    mockContract.twinCounter = 0
    mockContract.twinOwners = new Map()
    mockContract.twinStatus = new Map()
    mockContract.twinIPFS = new Map()
  })

  it("should allow admin to mint tokens", () => {
    const result = mockContract.mint("ST1ADMIN", user1, 1_000n)
    expect(result).toEqual({ value: true })
    expect(mockContract.balances.get(user1)).toBe(1_000n)
  })

  it("should prevent minting over max supply", () => {
    const result = mockContract.mint("ST1ADMIN", user1, 600_000_000n)
    expect(result).toEqual({ error: 103 })
  })

  it("should allow transfer of tokens", () => {
    mockContract.mint("ST1ADMIN", user1, 500n)
    const result = mockContract.transfer(user1, user2, 200n)
    expect(result).toEqual({ value: true })
    expect(mockContract.balances.get(user1)).toBe(300n)
    expect(mockContract.balances.get(user2)).toBe(200n)
  })

  it("should stake tokens", () => {
    mockContract.mint("ST1ADMIN", user1, 1000n)
    const result = mockContract.stake(user1, 400n)
    expect(result).toEqual({ value: true })
    expect(mockContract.staked.get(user1)).toBe(400n)
    expect(mockContract.balances.get(user1)).toBe(600n)
  })

  it("should unstake tokens", () => {
    mockContract.mint("ST1ADMIN", user1, 1000n)
    mockContract.stake(user1, 400n)
    const result = mockContract.unstake(user1, 200n)
    expect(result).toEqual({ value: true })
    expect(mockContract.staked.get(user1)).toBe(200n)
    expect(mockContract.balances.get(user1)).toBe(800n)
  })

  it("should register a new digital twin", () => {
    const result = mockContract.registerTwin(user1, "QmXYZ...123")
    expect(result.value).toBe(1)
    expect(mockContract.twinOwners.get(1)).toBe(user1)
    expect(mockContract.twinStatus.get(1)).toBe("commissioned")
  })

  it("should allow twin owner to update status", () => {
    mockContract.registerTwin(user1, "QmXYZ...123")
    const result = mockContract.updateTwinStatus(user1, 1, "operational")
    expect(result).toEqual({ value: true })
    expect(mockContract.twinStatus.get(1)).toBe("operational")
  })

  it("should prevent non-owner from updating twin", () => {
    mockContract.registerTwin(user1, "QmXYZ...123")
    const result = mockContract.updateTwinStatus(user2, 1, "maintenance")
    expect(result).toEqual({ error: 106 })
  })

  it("should prevent actions when paused", () => {
    mockContract.setPaused("ST1ADMIN", true)
    const result = mockContract.transfer(user1, user2, 10n)
    expect(result).toEqual({ error: 104 })
  })
})