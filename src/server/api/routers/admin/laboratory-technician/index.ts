import { capitalize } from "@/lib/utils";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { hashSync } from "bcryptjs";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const laboratoryTechnicianRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const { page = 1, perPage = 10, name, sort } = input;

		const orderBy: Prisma.LaboratoryTechnicianOrderByWithRelationInput[] = [];

		if (sort && sort.length > 0) {
			for (const sortItem of sort) {
				if (["name", "username", "email", "phone", "createdAt"].includes(sortItem.id)) {
					orderBy.push({
						user: {
							[sortItem.id]: sortItem.desc ? "desc" : "asc",
						},
					});
				} else {
					orderBy.push({
						[sortItem.id]: sortItem.desc ? "desc" : "asc",
					});
				}
			}
		}

		const laboratoryTechnicians = await ctx.db.laboratoryTechnician.findMany({
			skip: (page - 1) * perPage,
			take: perPage,
			where: {
				user: {
					name: {
						contains: name,
					},
				},
			},
			orderBy: orderBy.length > 0 ? orderBy : undefined,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true,
						phone: true,
						email: true,
						createdAt: true,
					},
				},
			},
		});

		return laboratoryTechnicians;
	}),
	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const { specialization, password, name, confirmPassword, ...user } = input;

		const existingUser = await ctx.db.user.findUnique({
			where: {
				username: user.username,
			},
		});

		if (existingUser) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kullanıcı adı zaten mevcut.",
			});
		}

		const capitalizedName = capitalize(name);
		const hashedPassword = hashSync(password, 10);

		const laboratoryTechnician = await ctx.db.laboratoryTechnician.create({
			data: {
				name: capitalizedName,
				user: {
					create: {
						...user,
						name: capitalizedName,
						password: hashedPassword,
					},
				},
				specialization,
			},
		});

		return laboratoryTechnician;
	}),
	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const { id, specialization, ...user } = input;

		const existingUsername = await ctx.db.user.findUnique({
			where: {
				laboratoryTechnician: {
					id: {
						not: id,
					},
				},
				username: user.username,
			},
		});

		if (existingUsername) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kullanıcı adı zaten mevcut.",
			});
		}

		await ctx.db.laboratoryTechnician.update({
			where: { id },
			data: {
				user: {
					update: {
						...user,
					},
				},
				specialization,
			},
		});
	}),
	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		const { id } = input;

		await ctx.db.user.delete({ where: { id } });
	}),
});
