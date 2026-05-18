// src/services/db/mutationDSL.ts

export type SQLStatement = any; // Representing D1.prepare() result type

export interface MutationEvent {
  eventType: string;
  payload: any;
}

export interface Mutation<T> {
  statements: SQLStatement[];
  event: MutationEvent;
}

/**
 * Factory to define a mutation intent.
 */
export function createMutation<T>(statements: SQLStatement[], event: MutationEvent): Mutation<T> {
  return { statements, event };
}
