import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createSchema, deleteSchema, getAllSchema, getByIdSchema, updateSchema } from "./schema";

export const patientRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const { page = 1, perPage = 10, name, dentistId, clinicId, sort } = input;

		const orderBy: Prisma.PatientOrderByWithRelationInput[] = [];

		if (sort && sort.length > 0) {
			for (const sortItem of sort) {
				if (sortItem.id === "dentist") {
					orderBy.push({
						dentist: {
							user: {
								name: sortItem.desc ? "desc" : "asc",
							},
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

		const patients = await ctx.db.patient.findMany({
			skip: (page - 1) * perPage,
			take: perPage,
			where: {
				isDeleted: false,
				...(name
					? {
							name: {
								contains: name,
								mode: "insensitive",
							},
						}
					: {}),
				...(dentistId ? { dentistId } : {}),
				...(clinicId ? { clinicId } : {}),
			},
			orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: "desc" }],
			include: {
				dentist: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
							},
						},
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

		return patients;
	}),

	getById: adminProcedure.input(getByIdSchema).query(async ({ ctx, input }) => {
		const patient = await ctx.db.patient.findUnique({
			where: {
				id: input.id,
				isDeleted: false,
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
							},
						},
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

		if (!patient) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Hasta bulunamadı.",
			});
		}

		return patient;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const { name, notes, dentistId } = input;

		const dentist = await ctx.db.dentist.findUnique({
			where: {
				id: dentistId,
				isDeleted: false,
			},
		});

		if (!dentist) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Belirtilen diş hekimi bulunamadı.",
			});
		}

		const patient = await ctx.db.patient.create({
			data: {
				name,
				notes,
				dentist: { connect: { id: dentistId } },
				clinic: { connect: { id: dentist.clinicId } },
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				clinic: true,
			},
		});

		return patient;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const { id, name, notes, dentistId } = input;

		const patient = await ctx.db.patient.findUnique({
			where: {
				id,
				isDeleted: false,
			},
		});

		if (!patient) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Hasta bulunamadı.",
			});
		}

		const dentist = await ctx.db.dentist.findUnique({
			where: {
				id: dentistId,
				isDeleted: false,
			},
		});

		if (!dentist) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Belirtilen diş hekimi bulunamadı.",
			});
		}

		const updatedPatient = await ctx.db.patient.update({
			where: { id },
			data: {
				name,
				notes,
				dentist: { connect: { id: dentistId } },
				clinic: { connect: { id: dentist.clinicId } },
			},
			include: {
				dentist: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				clinic: true,
			},
		});

		return updatedPatient;
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		const { id } = input;

		const patient = await ctx.db.patient.findUnique({
			where: {
				id,
				isDeleted: false,
			},
			include: {
				dentalWorks: {
					where: {
						isDeleted: false,
					},
				},
			},
		});

		if (!patient) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Hasta bulunamadı.",
			});
		}

		if (patient.dentalWorks.length > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu hastaya ait dental işlemler bulunmaktadır. Lütfen önce işlemleri silin.",
			});
		}

		await ctx.db.patient.update({
			where: { id },
			data: {
				isDeleted: true,
			},
		});

		return true;
	}),
});
