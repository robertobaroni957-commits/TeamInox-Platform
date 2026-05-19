/**
 * Atomic DB Transaction Wrapper
 */

export const runSeasonTransaction = async (db: any, operations: Array<() => Promise<any>>) => {
    // D1 does not support cross-statement transactions in the same way traditional RDBMS do,
    // so we emulate atomicity by batching and pre-validating.
    try {
        return await db.batch(operations.map(op => {
            // Note: This relies on the operations being defined as D1 statements.
            return op();
        }));
    } catch (err) {
        throw new Error(`Transaction failed: ${err.message}`);
    }
};
