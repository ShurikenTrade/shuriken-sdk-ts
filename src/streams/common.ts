// ─────────────────────────────────────────────────────────────────────────────
// Shared stream primitives
//
// Types shared across SVM, EVM, and alpha stream payloads.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Network identifier matching the `NetworkId` proto enum.
 *
 * Serialised as a lowercase string over the wire by the API.
 */
export type Network = 'eth' | 'base' | 'blast' | 'avax' | 'bsc' | 'trx' | 'sol' | 'monad' | 'hype'
