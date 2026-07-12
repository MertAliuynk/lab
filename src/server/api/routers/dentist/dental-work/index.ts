import { createTRPCRouter, dentistProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { sendNewPatientNotificationToTechnician } from "@/lib/notifications";
import type { NewPatientNotification } from "@/types/socket";
import {
	createDentalWorkSchema,
	deleteDentalWorkSchema,
	deleteStageHistorySchema,
	getByIdSchema,
	getClinicPricesForProsthesisTypesSchema,
	getDentalWorksByPatientIdSchema,
	getDentalWorksSchema,
	getStageHistorySchema,
	getTechnicianStageHistorySchema,
	updateDentalWorkSchema,
	updateDentalWorkStageSchema,
} from "./schema";

export const dentalWorkRouter = createTRPCRouter({
	getAll: dentistProcedure.input(getDentalWorksSchema).query(async ({ ctx, input }) => {
		if (!ctx.dentist) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Doktor bilgisi bulunamadı",
			});
		}

		const where = {
			dentistId: ctx.dentist.id,
			isDeleted: false, // Silinmiş işlemleri hariç tut
			...(input.patientId ? { patientId: input.patientId } : {}),
			...(input.startDate || input.endDate
				? {
						createdAt: {
							...(input.startDate ? { gte: input.startDate } : {}),
							...(input.endDate ? { lte: input.endDate } : {}),
						},
					}
				: {}),
			...(input.onlyCompleted
				? {
						patient: {
							isCompleted: true,
						},
					}
				: {}),
		};

		const dentalWorks = await ctx.db.dentalWork.findMany({
			where,
			include: {
				patient: true,
				prosthesisType: true,
				prosthesisStage: true,
				toothColor: true,
				dentalWorkAdditionalTreatments: {
					include: {
						additionalTreatment: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: input.perPage,
			skip: input.page && input.perPage ? (input.page - 1) * input.perPage : undefined,
		});

		return dentalWorks;
	}),

	getById: dentistProcedure.input(getByIdSchema).query(async ({ ctx, input }) => {
		if (!ctx.dentist) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Doktor bilgisi bulunamadı",
			});
		}

		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.dentalWorkId,
				dentistId: ctx.dentist.id,
			},
			include: {
				patient: true,
				prosthesisType: true,
				prosthesisStage: true,
				toothColor: true,
				dentalWorkAdditionalTreatments: {
					include: {
						additionalTreatment: true,
					},
				},
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		return dentalWork;
	}),

	getByPatientId: dentistProcedure.input(getDentalWorksByPatientIdSchema).query(async ({ ctx, input }) => {
		const dentalWorks = await ctx.db.dentalWork.findMany({
			where: {
				patientId: input.patientId,
				dentistId: ctx.dentist!.id,
				isDeleted: false, // Silinmiş işlemleri hariç tut
			},
			   include: {
				   patient: true,
				   prosthesisType: true,
				   prosthesisStage: true,
				   toothColor: true,
				   dentalWorkAdditionalTreatments: {
					   include: {
						   additionalTreatment: true,
					   },
				   },
			   },
			orderBy: { createdAt: "desc" },
		});

		return dentalWorks;
	}),

	getStageHistory: dentistProcedure.input(getStageHistorySchema).query(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.dentalWorkId,
				dentistId: ctx.dentist!.id,
				isDeleted: false, // Silinmiş işlemleri hariç tut
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		const stageHistory = await ctx.db.stageHistory.findMany({
			where: {
				dentalWorkId: input.dentalWorkId,
			},
			include: {
				prosthesisStage: true,
				laboratoryTechnician: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return stageHistory;
	}),

	getTechnicianStageHistory: dentistProcedure.input(getTechnicianStageHistorySchema).query(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.dentalWorkId,
				dentistId: ctx.dentist!.id,
				isDeleted: false, // Silinmiş işlemleri hariç tut
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		const technicianStageHistory = await ctx.db.technicianStageHistory.findMany({
			where: {
				dentalWorkId: input.dentalWorkId,
			},
			include: {
				technicianStage: true,
				laboratoryTechnician: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return technicianStageHistory;
	}),

	getClinicPricesForProsthesisTypes: dentistProcedure
		.input(getClinicPricesForProsthesisTypesSchema)
		.query(async ({ ctx, input }) => {
			const clinicPrices = await ctx.db.clinicProsthesisPrice.findMany({
				where: {
					clinicId: ctx.dentist!.clinicId,
					prosthesisTypeId: {
						in: input.prosthesisTypeIds,
					},
					isDeleted: false,
				},
				include: {
					prosthesisType: true,
				},
			});

			const priceMap: Record<string, number> = {};

			for (const price of clinicPrices) {
				priceMap[price.prosthesisTypeId] = price.price;
			}

			const allProsthesisTypes = await ctx.db.prosthesisType.findMany({
				where: {
					id: {
						in: input.prosthesisTypeIds,
					},
					isDeleted: false,
				},
			});

			for (const type of allProsthesisTypes) {
				if (!priceMap[type.id]) {
					priceMap[type.id] = type.defaultPrice || 0;
				}
			}

			return priceMap;
		}),

	create: dentistProcedure.input(createDentalWorkSchema).mutation(async ({ ctx, input }) => {
		let patientId = input.patientId;

		// Teknisyen ise dentistId parametresinden doktor bilgisini al
		let effectiveDentist = ctx.dentist;
		if (!effectiveDentist && input.dentistId) {
			effectiveDentist = await ctx.db.dentist.findUnique({
				where: { id: input.dentistId },
			});
			
			if (!effectiveDentist) {
				throw new Error("Belirtilen doktor bulunamadı");
			}
		}

		if (!effectiveDentist) {
			throw new Error("Doktor bilgisi bulunamadı");
		}

		if (!patientId && input.patientName) {
			const newPatient = await ctx.db.patient.create({
				data: {
					name: input.patientName,
					dentistId: effectiveDentist.id,
					clinicId: effectiveDentist.clinicId,
				},
			});
			patientId = newPatient.id;
		}

		if (!patientId) {
			throw new Error("Hasta ID'si veya hasta adı gereklidir");
		}

		const prosthesisType = await ctx.db.prosthesisType.findUnique({
			where: { id: input.prosthesisTypeId },
		});

		if (!prosthesisType) {
			throw new Error("Protez tipi bulunamadı");
		}

		const clinicPrice = await ctx.db.clinicProsthesisPrice.findUnique({
			where: {
				clinicId_prosthesisTypeId: {
					clinicId: effectiveDentist.clinicId,
					prosthesisTypeId: input.prosthesisTypeId,
				},
			},
		});

		const unitPrice = clinicPrice?.price || prosthesisType.defaultPrice || 0;
		let totalPrice = 0;
		let quantity = 1;

		if (prosthesisType.pricingType === "JAW_BASED") {
			quantity = input.selectedJaws?.length || 1;
			totalPrice = unitPrice * quantity;
		} else {
			quantity = input.selectedTeeth?.length || 1;
			totalPrice = unitPrice * quantity;
		}

		const dentalWork = await ctx.db.dentalWork.create({
			data: {
				dentistId: effectiveDentist.id,
				patientId: patientId,
				prosthesisTypeId: input.prosthesisTypeId,
				prosthesisStageId: input.prosthesisStageId,
				toothColorId: input.toothColorId,
				jawType: input.jawType,
				notes: input.notes,
				deliveryDate: input.deliveryDate,
				selectedTeeth: input.selectedTeeth,
				selectedJaws: input.selectedJaws,
				unitPrice: unitPrice,
				totalPrice: totalPrice,
				attachments: input.attachments,
			},
		});

		if (input.prosthesisStageId) {
			await ctx.db.stageHistory.create({
				data: {
					dentalWorkId: dentalWork.id,
					prosthesisStageId: input.prosthesisStageId,
					...(input.notes ? { notes: input.notes } : {}),
					...(input.attachments ? { attachments: input.attachments } : {}),
				},
			});
		}

		// NOT: Ödeme kaydı hasta bitimi yapıldığında oluşturulacak

		// Teknisyene yeni hasta/protez bildirimi gönder
		try {
			console.log(`[DEBUG] Yeni hasta bildirimi için teknisyenler aranıyor...`);
			
			// Tüm aktif teknisyenleri bul
			const technicians = await ctx.db.laboratoryTechnician.findMany({
				where: {
					isDeleted: false,
				},
				include: {
					user: true,
				},
			});

			console.log(`[DEBUG] ${technicians.length} aktif teknisyen bulundu:`, technicians.map(t => `${t.id} - ${t.user.name}`));

			// Patient ve prosthesis type bilgilerini al
			const patient = await ctx.db.patient.findUnique({
				where: { id: patientId },
			});

			const clinic = await ctx.db.clinic.findUnique({
				where: { id: effectiveDentist.clinicId },
			});

			// Dentist user bilgisini al
			const dentistWithUser = await ctx.db.dentist.findUnique({
				where: { id: effectiveDentist.id },
				include: {
					user: true,
				},
			});

			if (patient && prosthesisType && clinic && technicians.length > 0 && dentistWithUser) {
				console.log(`[DEBUG] Tüm gerekli bilgiler mevcut. Bildirim gönderiliyor...`);
				
				// Veritabanına bildirim kaydet
				const savedNotification = await ctx.db.notification.create({
					data: {
						patientName: patient.name,
						patientId: patient.id,
						prosthesisType: prosthesisType.name,
						newStage: "Yeni protez oluşturuldu",
						dentistName: dentistWithUser.user.name || "Doktor",
						clinicName: clinic.name,
						dentalWorkId: dentalWork.id,
					},
				});

				console.log(`[DEBUG] Veritabanına bildirim kaydedildi:`, savedNotification.id);

				// NotificationRead tablosuna kayıt ekle (ÇALIŞAN KODDAN ALINDI)
				const notificationReadsData = technicians.map((technician) => ({
					notificationId: savedNotification.id,
					userId: technician.userId,
					isRead: false,
				}));

				await ctx.db.notificationRead.createMany({
					data: notificationReadsData,
				});

				console.log(`[DEBUG] NotificationRead kayıtları oluşturuldu:`, notificationReadsData.length);

				// Her teknisyene HTTP API ile bildirim gönder (ÇALIŞAN KODDAN ALINDI)
				let sentCount = 0;
				for (const technician of technicians) {
					console.log(`[DEBUG] Teknisyen ${technician.id} (${technician.user.name}) için bildirim gönderiliyor...`);
					
					const notification = {
						id: savedNotification.id,
						patientName: patient.name,
						patientId: patient.id,
						prosthesisType: prosthesisType.name,
						newStage: "Yeni protez oluşturuldu",
						dentistName: dentistWithUser.user.name || "Doktor",
						clinicName: clinic.name,
						laboratoryTechnicianId: technician.userId, // ÖNEMLİ: userId kullanıyoruz!
						dentalWorkId: dentalWork.id,
						timestamp: savedNotification.createdAt,
						type: "prosthesisUpdate", // newPatient yerine prosthesisUpdate kullanıyoruz
					};

					try {
						await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(notification),
						});
						sentCount++;
						console.log(`[DEBUG] Teknisyen ${technician.id} için HTTP bildirim gönderildi`);
					} catch (error) {
						console.error(`[DEBUG] Teknisyen ${technician.id} için bildirim hatası:`, error);
					}
				}
				
				console.log(`[DEBUG] Toplam ${sentCount} teknisyene HTTP bildirim gönderildi.`);
			} else {
				console.log(`[DEBUG] Bildirim gönderilmedi. Eksik bilgiler:`, {
					hasPatient: !!patient,
					hasProsthesisType: !!prosthesisType, 
					hasClinic: !!clinic,
					technicianCount: technicians.length,
					hasDentistWithUser: !!dentistWithUser
				});
			}
		} catch (error) {
			console.error("Yeni hasta bildirimi gönderilirken hata:", error);
			// Hata olsa bile dental work oluşturma işlemini devam ettir
		}

		return dentalWork;
	}),

	update: dentistProcedure.input(updateDentalWorkSchema).mutation(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.dentalWorkId,
				dentistId: ctx.dentist!.id,
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		const updatedDentalWork = await ctx.db.dentalWork.update({
			where: { id: input.dentalWorkId },
			data: {
				...(input.prosthesisStageId && { prosthesisStageId: input.prosthesisStageId }),
				...(input.toothColorId && { toothColorId: input.toothColorId }),
				...(input.jawType && { jawType: input.jawType }),
				...(input.notes !== undefined && { notes: input.notes }),
				...(input.deliveryDate && { deliveryDate: input.deliveryDate }),
				...(input.selectedTeeth && { selectedTeeth: input.selectedTeeth }),
				...(input.attachments !== undefined && { attachments: input.attachments }),
			},
		});

		return updatedDentalWork;
	}),

	updateStage: dentistProcedure.input(updateDentalWorkStageSchema).mutation(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.dentalWorkId,
				dentistId: ctx.dentist!.id,
			},
			include: {
				patient: true,
				prosthesisType: true,
			},
		});

		if (!dentalWork) {
			throw new Error("Diş çalışması bulunamadı");
		}

		// Doktor aşama güncelleyince kuryeye ver notlarını temizle
		const kuryeNotes = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI"];
		const shouldClearNotes = dentalWork.notes && kuryeNotes.includes(dentalWork.notes);

		await ctx.db.dentalWork.update({
			where: { id: input.dentalWorkId },
			data: {
				prosthesisStageId: input.prosthesisStageId,
				...(shouldClearNotes ? { notes: null } : {}),
			},
		});

		const newStage = await ctx.db.prosthesisStage.findUnique({
			where: { id: input.prosthesisStageId },
		});

		await ctx.db.stageHistory.create({
			data: {
				dentalWorkId: input.dentalWorkId,
				prosthesisStageId: input.prosthesisStageId,
				notes: input.notes,
				dentistId: ctx.dentist!.id,
				...(input.attachments ? { attachments: input.attachments } : {}),
			},
		});

		if (newStage) {
			const dentist = await ctx.db.dentist.findUnique({
				where: { id: ctx.dentist!.id },
				include: { clinic: true, user: true },
			});

			const allTechnicians = await ctx.db.laboratoryTechnician.findMany({
				where: { isDeleted: false },
				include: { user: true },
			});

			if (dentist && allTechnicians.length > 0) {
				const savedNotification = await ctx.db.notification.create({
					data: {
						patientName: dentalWork.patient.name,
						patientId: dentalWork.patient.id,
						prosthesisType: dentalWork.prosthesisType.name,
						newStage: newStage.name,
						dentistName: dentist.user?.name || dentist.title || "Hekim",
						clinicName: dentist.clinic.name,
						dentalWorkId: dentalWork.id,
					},
				});

				const notificationReadsData = allTechnicians.map((technician) => ({
					notificationId: savedNotification.id,
					userId: technician.userId,
					isRead: false,
				}));

				await ctx.db.notificationRead.createMany({
					data: notificationReadsData,
				});

				for (const technician of allTechnicians) {
					const notification = {
						id: savedNotification.id,
						patientName: dentalWork.patient.name,
						patientId: dentalWork.patient.id,
						prosthesisType: dentalWork.prosthesisType.name,
						newStage: newStage.name,
						dentistName: dentist.user?.name || dentist.title || "Hekim",
						clinicName: dentist.clinic.name,
						laboratoryTechnicianId: technician.userId,
						dentalWorkId: dentalWork.id,
						timestamp: savedNotification.createdAt,
						type: "prosthesisUpdate",
					};

					try {
						await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(notification),
						});
					} catch {}
				}
			}
		} else {
			console.log("⚠️ Stage bulunamadı");
		}

		return { success: true };
	}),

	delete: dentistProcedure.input(deleteDentalWorkSchema).mutation(async ({ ctx, input }) => {
		const dentalWork = await ctx.db.dentalWork.findFirst({
			where: {
				id: input.id,
				dentistId: ctx.dentist!.id,
			},
		});

		if (!dentalWork) {
			throw new Error("Protez bulunamadı");
		}

		await ctx.db.dentalWork.update({
			where: {
				id: input.id,
			},
			data: {
				isDeleted: true,
			},
		});

		return { success: true };
	}),

	deleteStageHistory: dentistProcedure.input(deleteStageHistorySchema).mutation(async ({ ctx, input }) => {
		const stageHistory = await ctx.db.stageHistory.findFirst({
			where: {
				id: input.stageHistoryId,
			},
			include: {
				dentalWork: true,
			},
		});

		if (!stageHistory || stageHistory.dentalWork.dentistId !== ctx.dentist!.id) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Aşama geçmişi bulunamadı",
			});
		}

		if (stageHistory.notes === "BITIM_YAPILDI") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Bitim kaydını geri almak için 'Bitimi Geri Al' butonunu kullanın",
			});
		}

		const latestEntry = await ctx.db.stageHistory.findFirst({
			where: { dentalWorkId: stageHistory.dentalWorkId },
			orderBy: { createdAt: "desc" },
		});

		if (!latestEntry || latestEntry.id !== stageHistory.id) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Sadece en son eklenen aşama silinebilir",
			});
		}

		await ctx.db.stageHistory.delete({
			where: { id: input.stageHistoryId },
		});

		const previousEntry = await ctx.db.stageHistory.findFirst({
			where: { dentalWorkId: stageHistory.dentalWorkId },
			orderBy: { createdAt: "desc" },
		});

		await ctx.db.dentalWork.update({
			where: { id: stageHistory.dentalWorkId },
			data: {
				prosthesisStageId: previousEntry?.prosthesisStageId ?? null,
			},
		});

		return { success: true };
	}),
});
