import { capitalize } from "@/lib/utils";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { hashSync } from "bcryptjs";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const dentistRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const { page = 1, perPage = 10, name, clinicId, sort } = input;

		const orderBy: Prisma.DentistOrderByWithRelationInput[] = [];

		if (sort && sort.length > 0) {
			for (const sortItem of sort) {
				if (["name", "username", "email", "phone", "createdAt"].includes(sortItem.id)) {
					orderBy.push({
						user: {
							[sortItem.id]: sortItem.desc ? "desc" : "asc",
						},
					});
				} else if (sortItem.id === "clinic") {
					orderBy.push({
						clinic: {
							name: sortItem.desc ? "desc" : "asc",
						},
					});
				} else {
					orderBy.push({
						[sortItem.id]: sortItem.desc ? "desc" : "asc",
					});
				}
			}
		}

		const dentists = await ctx.db.dentist.findMany({
			skip: perPage === 0 ? 0 : (page - 1) * perPage,
			take: perPage === 0 ? undefined : perPage,
			where: {
				isDeleted: false,
				...(name
					? {
							user: {
								name: {
									contains: name,
									mode: "insensitive",
								},
							},
						}
					: {}),
				...(clinicId ? { clinicId } : {}),
			},
			orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: "desc" }],
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true,
						email: true,
						phone: true,
						createdAt: true,
					},
				},
				clinic: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return dentists;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const { title, clinicId, password, name, confirmPassword, ...user } = input;

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

		const clinic = await ctx.db.clinic.findUnique({
			where: { id: clinicId, isDeleted: false },
		});

		if (!clinic) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Belirtilen klinik bulunamadı.",
			});
		}

		const capitalizedName = capitalize(name);
		const hashedPassword = hashSync(password, 10);

		const dentist = await ctx.db.dentist.create({
			data: {
				title,
				clinic: { connect: { id: clinicId } },
				user: {
					create: {
						...user,
						role: UserRole.DENTIST,
						name: capitalizedName,
						password: hashedPassword,
					},
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true,
					},
				},
				clinic: true,
			},
		});

		return dentist;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const { id, title, clinicId, ...userData } = input;

		const dentist = await ctx.db.dentist.findUnique({
			where: { id, isDeleted: false },
			include: { user: true },
		});

		if (!dentist) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş hekimi bulunamadı.",
			});
		}

		if (userData.username !== dentist.user.username) {
			const existingUser = await ctx.db.user.findUnique({
				where: {
					username: userData.username,
				},
			});

			if (existingUser) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Bu kullanıcı adı zaten mevcut.",
				});
			}
		}

		if (clinicId) {
			const clinic = await ctx.db.clinic.findUnique({
				where: { id: clinicId, isDeleted: false },
			});

			if (!clinic) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Belirtilen klinik bulunamadı.",
				});
			}
		}

		const updatedDentist = await ctx.db.dentist.update({
			where: { id },
			data: {
				title,
				clinic: clinicId ? { connect: { id: clinicId } } : undefined,
				user: {
					update: {
						...userData,
					},
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true,
					},
				},
				clinic: true,
			},
		});

		return updatedDentist;
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		const { id } = input;

		const dentist = await ctx.db.dentist.findUnique({
			where: { id, isDeleted: false },
			include: {
				user: true,
				patients: {
					where: {
						isDeleted: false,
					},
				},
				dentalWorks: {
					where: {
						isDeleted: false,
					},
				},
			},
		});

		if (!dentist) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Diş hekimi bulunamadı.",
			});
		}

		if (dentist.patients.length > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu diş hekimine ait hastalar bulunmaktadır. Lütfen önce hastaları başka bir diş hekimine aktarın.",
			});
		}

		if (dentist.dentalWorks.length > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					"Bu diş hekimine ait dental işlemler bulunmaktadır. Lütfen önce işlemleri başka bir diş hekimine aktarın.",
			});
		}

		await ctx.db.dentist.update({
			where: { id },
			data: {
				isDeleted: true,
				user: {
					update: {
						isDeleted: true,
					},
				},
			},
		});

		return true;
	}),
});
