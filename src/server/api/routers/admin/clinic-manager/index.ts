import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { hashSync } from "bcryptjs";
import { createSchema, deleteSchema, getAllSchema, updateSchema } from "./schema";

export const clinicManagerRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const { perPage, page, name, sort } = input;

		const where = {
			...(name ? { name: { contains: name, mode: "insensitive" as const } } : {}),
			isDeleted: false,
		};

		const clinics = await ctx.db.clinicManager.findMany({
			where,
			orderBy: sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: perPage === 0 ? undefined : perPage,
			skip: page && perPage && perPage !== 0 ? (page - 1) * perPage : undefined,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true,
						email: true,
						phone: true,
					},
				},
				clinic: true,
			},
		});

		return clinics;
	}),
	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const { clinicId, password, name, username, confirmPassword, ...userData } = input;

		const existingUser = await ctx.db.user.findUnique({
			where: { username },
		});

		if (existingUser) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kullanıcı adı zaten kullanılıyor.",
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

		const existingManager = await ctx.db.clinicManager.findUnique({
			where: { clinicId },
		});

		if (existingManager) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kliniğin zaten bir yöneticisi var.",
			});
		}

		const hashedPassword = hashSync(password, 10);

		const clinicManager = await ctx.db.clinicManager.create({
			data: {
				clinic: { connect: { id: clinicId } },
				user: {
					create: {
						name,
						username,
						password: hashedPassword,
						role: UserRole.CLINIC_MANAGER,
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

		return clinicManager;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const { id, ...userData } = input;

		const existingUser = await ctx.db.user.findUnique({
			where: { id },
			include: {
				clinicManager: true,
			},
		});

		if (!existingUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Kullanıcı bulunamadı",
			});
		}

		if (!existingUser.clinicManager) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kullanıcı bir klinik yöneticisi değil",
			});
		}

		if (userData.username && userData.username !== existingUser.username) {
			const existingUsername = await ctx.db.user.findUnique({
				where: { username: userData.username },
			});

			if (existingUsername) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Bu kullanıcı adı zaten kullanılıyor.",
				});
			}
		}

		const updatedUser = await ctx.db.user.update({
			where: { id },
			data: userData,
			include: {
				clinicManager: {
					include: {
						clinic: true,
					},
				},
			},
		});

		return updatedUser;
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		const { id } = input;

		const existingUser = await ctx.db.user.findUnique({
			where: { id },
			include: {
				clinicManager: true,
			},
		});

		if (!existingUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Kullanıcı bulunamadı",
			});
		}

		if (!existingUser.clinicManager) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bu kullanıcı bir klinik yöneticisi değil",
			});
		}

		await ctx.db.user.delete({
			where: { id },
		});

		return true;
	}),
});
