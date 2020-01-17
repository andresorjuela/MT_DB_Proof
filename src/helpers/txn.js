'use strict'

/**
 * Represents the results of a transaction.
 */
class TransactionResult {
  /**
   * constructor
   * @param {boolean} success whether the transaction succeeded or failed
   * @param {string} message information message about the transaction
   * @param {string} error error message pertaining to the transaction
   * @param {string} transcript a longer informational message indicating details
   * of the transaction processing.
   */
  constructor(success, message, error, transcript) {
    this.success = success || false;
    this.message = message || "";
    this.error = error || null;
    this.transcript = transcript || null;
  }

}

exports.TransactionResult = TransactionResult;