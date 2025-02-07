/**
 * Represents a single entry in the waitlist
 */
export interface WaitlistEntry {
  /** Ethereum wallet address of the user */
  walletAddress: string;
  /** Position in the waitlist (1-based) */
  position: number;
  /** Timestamp when the user joined the waitlist */
  joinedAt: number;
  /** Optional email address */
  email?: string;
}

/**
 * Metadata about the waitlist state
 */
export interface WaitlistMeta {
  /** Total number of entries currently in the waitlist */
  totalEntries: number;
  /** The last/highest position number used */
  lastPosition: number;
  /** Timestamp of the last update to the waitlist */
  updatedAt: number;
}

/**
 * Request body for creating a new waitlist entry
 */
export interface CreateWaitlistEntryRequest {
  walletAddress: string;
  email?: string;
}

/**
 * Response structure for waitlist queries
 */
export interface WaitlistResponse {
  entries: WaitlistEntry[];
  meta: WaitlistMeta;
} 