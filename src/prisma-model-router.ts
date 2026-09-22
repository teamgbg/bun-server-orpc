/**
 * @system orpc
 * @status handwritten
 * @edit edit directly
 *
 * Creates a full CRUD ORPC procedure set from a Prisma model delegate.
 * Each procedure accepts the same Prisma argument shape (where, select,
 * data, etc.) and returns the same Prisma return shape — callers swap
 * `prisma.X.Y(args)` for `orpc.X.Y(args)` while routing through ORPC
 * contracts.
 *
 * Extracted from scala-dev-mcp's orpc-client.ts — generic enough for
 * any in-process ORPC router that wraps Prisma models.
 */

import { os } from "@orpc/server";
import * as v from "valibot";

/**
 * Structural shape of a Prisma model delegate — the methods createPrismaModelRouter
 * wraps. Structural (not Record<string,...>, which wrongly requires a string index
 * signature that real Prisma delegates lack, rejecting the very delegates this
 * factory exists to wrap). A delegate carrying these methods (+ any extras) satisfies it.
 */
export type PrismaDelegate = {
	[K in
		| "findFirst"
		| "findMany"
		| "findUnique"
		| "create"
		| "update"
		| "updateMany"
		| "upsert"
		| "delete"
		| "deleteMany"
		| "count"
		| "groupBy"]: (args: never) => Promise<unknown>;
};

type DelegateResult<T extends PrismaDelegate, K extends keyof T> = T[K] extends (
	args: never,
) => Promise<infer TResult>
	? TResult
	: never;

export function createPrismaModelRouter<T extends PrismaDelegate>(
	prismaModel: T,
) {
	return {
		findFirst: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.findFirst(input as never) as Promise<
						DelegateResult<T, "findFirst">
					>,
			),
		findMany: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.findMany(input as never) as Promise<
						DelegateResult<T, "findMany">
					>,
			),
		findUnique: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.findUnique(input as never) as Promise<
						DelegateResult<T, "findUnique">
					>,
			),
		create: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.create(input as never) as Promise<DelegateResult<T, "create">>,
			),
		update: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.update(input as never) as Promise<DelegateResult<T, "update">>,
			),
		updateMany: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.updateMany(input as never) as Promise<
						DelegateResult<T, "updateMany">
					>,
			),
		upsert: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.upsert(input as never) as Promise<DelegateResult<T, "upsert">>,
			),
		delete:
			os
				.input(v.any())
				.handler(
					({ input }) =>
						prismaModel.delete(input as never) as Promise<
							DelegateResult<T, "delete">
						>,
				),
		deleteMany: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.deleteMany(input as never) as Promise<
						DelegateResult<T, "deleteMany">
					>,
			),
		count: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.count(input as never) as Promise<DelegateResult<T, "count">>,
			),
		groupBy: os
			.input(v.any())
			.handler(
				({ input }) =>
					prismaModel.groupBy(input as never) as Promise<
						DelegateResult<T, "groupBy">
					>,
			),
	};
}
