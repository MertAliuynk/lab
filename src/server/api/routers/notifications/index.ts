import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const notificationsRouter = createTRPCRouter({
	getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "LABORATORY_TECHNICIAN") {
			return [];
		}

		const unreadNotifications = await ctx.db.notificationRead.findMany({
			where: {
				userId: ctx.session.user.id,
				isRead: false,
			},
			include: {
				notification: true,
			},
			orderBy: {
				notification: {
					createdAt: "desc",
				},
			},
			take: 50,
		});

		return unreadNotifications.map((nr) => ({
			id: nr.notification.id,
			patientName: nr.notification.patientName,
			patientId: nr.notification.patientId || "",
			prosthesisType: nr.notification.prosthesisType,
			newStage: nr.notification.newStage,
			dentistName: nr.notification.dentistName,
			clinicName: nr.notification.clinicName,
			dentalWorkId: nr.notification.dentalWorkId,
			timestamp: nr.notification.createdAt,
			type: "prosthesisUpdate" as const,
			read: nr.isRead,
			notificationReadId: nr.id,
		}));
	}),

	getAllNotifications: protectedProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				perPage: z.number().min(1).max(100).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "LABORATORY_TECHNICIAN") {
				return { notifications: [], total: 0 };
			}

			const [notificationReads, total] = await Promise.all([
				ctx.db.notificationRead.findMany({
					where: {
						userId: ctx.session.user.id,
					},
					include: {
						notification: true,
					},
					orderBy: {
						notification: {
							createdAt: "desc",
						},
					},
					skip: (input.page - 1) * input.perPage,
					take: input.perPage,
				}),
				ctx.db.notificationRead.count({
					where: {
						userId: ctx.session.user.id,
					},
				}),
			]);

			const notifications = notificationReads.map((nr) => ({
				id: nr.notification.id,
				patientName: nr.notification.patientName,
				patientId: nr.notification.patientId || "",
				prosthesisType: nr.notification.prosthesisType,
				newStage: nr.notification.newStage,
				dentistName: nr.notification.dentistName,
				clinicName: nr.notification.clinicName,
				dentalWorkId: nr.notification.dentalWorkId,
				timestamp: nr.notification.createdAt,
				type: "prosthesisUpdate" as const,
				read: nr.isRead,
				readAt: nr.readAt,
				notificationReadId: nr.id,
			}));

			return { notifications, total };
		}),

	markAsRead: protectedProcedure
		.input(
			z.object({
				notificationId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const notificationRead = await ctx.db.notificationRead.findFirst({
				where: {
					userId: ctx.session.user.id,
					notificationId: input.notificationId,
				},
			});

			if (!notificationRead) {
				throw new Error("Bildirim bulunamadı");
			}

			await ctx.db.notificationRead.update({
				where: {
					id: notificationRead.id,
				},
				data: {
					isRead: true,
					readAt: new Date(),
				},
			});

			return { success: true };
		}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db.notificationRead.updateMany({
			where: {
				userId: ctx.session.user.id,
				isRead: false,
			},
			data: {
				isRead: true,
				readAt: new Date(),
			},
		});

		return { success: true };
	}),

	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "LABORATORY_TECHNICIAN") {
			return 0;
		}

		const count = await ctx.db.notificationRead.count({
			where: {
				userId: ctx.session.user.id,
				isRead: false,
			},
		});

		return count;
	}),
});
