import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { updatePasswordSchema, updateUserSchema } from "../../schema";
import { resetPasswordSchema } from "./schema";

export const userRouter = createTRPCRouter({
	me: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				id: true,
				name: true,
				username: true,
				role: true,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Kullanıcı bulunamadı",
			});
		}

		return user;
	}),

	update: protectedProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
		const existingUser = await ctx.db.user.findFirst({
			where: {
				username: input.username,
				NOT: {
					id: ctx.session.user.id,
				},
			},
		});

		if (existingUser) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Bu kullanıcı adı zaten kullanılıyor",
			});
		}

		const updatedUser = await ctx.db.user.update({
			where: { id: ctx.session.user.id },
			data: {
				name: input.name,
				username: input.username,
			},
		});

		return updatedUser;
	}),

	updatePassword: protectedProcedure.input(updatePasswordSchema).mutation(async ({ ctx, input }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Kullanıcı bulunamadı",
			});
		}

		const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);

		if (!isPasswordValid) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Mevcut şifre yanlış",
			});
		}

		const hashedPassword = await bcrypt.hash(input.newPassword, 10);

		const updatedUser = await ctx.db.user.update({
			where: { id: ctx.session.user.id },
			data: {
				password: hashedPassword,
			},
		});

		return updatedUser;
	}),
	resetPassword: protectedProcedure.input(resetPasswordSchema).mutation(async ({ ctx, input }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Kullanıcı bulunamadı",
			});
		}

		const hashedPassword = await bcrypt.hash(input.password, 10);

		const updatedUser = await ctx.db.user.update({
			where: { id: ctx.session.user.id },
			data: {
				password: hashedPassword,
			},
		});

		return updatedUser;
	}),
});
