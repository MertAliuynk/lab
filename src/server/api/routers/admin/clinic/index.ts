import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
	createSchema,
	deleteSchema,
	getAllSchema,
	getClinicPricesSchema,
	updateClinicPricesSchema,
	updateSchema,
} from "./schema";

export const clinicRouter = createTRPCRouter({
	getAll: adminProcedure.input(getAllSchema).query(async ({ ctx, input }) => {
		const { perPage, page, name, sort } = input;

		const where = {
			...(name ? { name: { contains: name, mode: "insensitive" as const } } : {}),
			isDeleted: false,
		};

		const clinics = await ctx.db.clinic.findMany({
			where,
			orderBy: sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" })) ?? [{ createdAt: "desc" }],
			take: perPage === 0 ? undefined : perPage,
			skip: page && perPage && perPage !== 0 ? (page - 1) * perPage : undefined,
			include: {
				manager: {
					include: {
						user: {
							select: {
								name: true,
								username: true,
								email: true,
								phone: true,
							},
						},
					},
				},
				dentists: {
					where: {
						isDeleted: false,
					},
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				patients: {
					where: {
						isDeleted: false,
					},
				},
			},
		});

		return clinics;
	}),

	create: adminProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
		const clinic = await ctx.db.clinic.create({
			data: {
				name: input.name,
				address: input.address,
			},
		});

		// Klinik oluşturulduğunda tüm protez türleri için default fiyatları kopyala
		const prosthesisTypes = await ctx.db.prosthesisType.findMany({
			where: {
				isDeleted: false,
				defaultPrice: {
					not: null,
				},
			},
		});

		if (prosthesisTypes.length > 0) {
			await ctx.db.clinicProsthesisPrice.createMany({
				data: prosthesisTypes.map((type) => ({
					clinicId: clinic.id,
					prosthesisTypeId: type.id,
					price: type.defaultPrice || 0,
				})),
			});
		}

		return clinic;
	}),

	update: adminProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
		const { id, ...data } = input;

		const existingClinic = await ctx.db.clinic.findUnique({
			where: { id },
		});

		if (!existingClinic) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Klinik bulunamadı",
			});
		}

		const updatedClinic = await ctx.db.clinic.update({
			where: { id },
			data,
		});

		return updatedClinic;
	}),

	delete: adminProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
		const { id } = input;

		const existingClinic = await ctx.db.clinic.findUnique({
			where: { id },
		});

		if (!existingClinic) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Klinik bulunamadı",
			});
		}

		const clinicManager = await ctx.db.clinicManager.findUnique({
			where: { clinicId: id },
		});

		if (clinicManager) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Klinik yöneticisi olan klinik silinemez. Önce yöneticiyi başka bir klinikle ilişkilendirin.",
			});
		}

		const dentistsCount = await ctx.db.dentist.count({
			where: {
				clinicId: id,
				isDeleted: false,
			},
		});

		if (dentistsCount > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Diş hekimi olan klinik silinemez. Önce diş hekimlerini başka bir klinikle ilişkilendirin.",
			});
		}

		const patientsCount = await ctx.db.patient.count({
			where: {
				clinicId: id,
				isDeleted: false,
			},
		});

		if (patientsCount > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Hastası olan klinik silinemez. Önce hastaları başka bir klinikle ilişkilendirin.",
			});
		}

		await ctx.db.clinic.update({
			where: { id },
			data: {
				isDeleted: true,
			},
		});

		return true;
	}),

	getClinicPrices: adminProcedure.input(getClinicPricesSchema).query(async ({ ctx, input }) => {
		const { clinicId } = input;

		// Kliniğin mevcut fiyatlarını ve protez türlerini getir
		const clinicPrices = await ctx.db.clinicProsthesisPrice.findMany({
			where: {
				clinicId,
				isDeleted: false,
			},
			include: {
				prosthesisType: true,
			},
		});

		// Tüm protez türlerini getir
		const allProsthesisTypes = await ctx.db.prosthesisType.findMany({
			where: {
				isDeleted: false,
			},
		});

		// Eğer klinik için fiyat belirtilmemiş protez türleri varsa, default fiyatları ekle
		const missingTypes = allProsthesisTypes.filter(
			(type) => !clinicPrices.some((price) => price.prosthesisTypeId === type.id),
		);

		if (missingTypes.length > 0) {
			await ctx.db.clinicProsthesisPrice.createMany({
				data: missingTypes.map((type) => ({
					clinicId,
					prosthesisTypeId: type.id,
					price: type.defaultPrice || 0,
				})),
			});

			// Güncellenmiş listeyi tekrar getir
			return await ctx.db.clinicProsthesisPrice.findMany({
				where: {
					clinicId,
					isDeleted: false,
				},
				include: {
					prosthesisType: true,
				},
				orderBy: {
					prosthesisType: {
						name: "asc",
					},
				},
			});
		}

		return clinicPrices.sort((a, b) => a.prosthesisType.name.localeCompare(b.prosthesisType.name));
	}),

	updateClinicPrices: adminProcedure.input(updateClinicPricesSchema).mutation(async ({ ctx, input }) => {
		const { clinicId, prices } = input;

		// Kliniğin var olduğunu kontrol et
		const clinic = await ctx.db.clinic.findUnique({
			where: { id: clinicId },
		});

		if (!clinic) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Klinik bulunamadı",
			});
		}

		// Toplu güncelleme işlemi
		await Promise.all(
			prices.map(async (priceData) => {
				await ctx.db.clinicProsthesisPrice.upsert({
					where: {
						clinicId_prosthesisTypeId: {
							clinicId,
							prosthesisTypeId: priceData.prosthesisTypeId,
						},
					},
					update: {
						price: priceData.price,
					},
					create: {
						clinicId,
						prosthesisTypeId: priceData.prosthesisTypeId,
						price: priceData.price,
					},
				});
			}),
		);

		return true;
	}),

	fixHistoricalPrices: adminProcedure.mutation(async ({ ctx }) => {
		// Fiyatı boş olan tüm DentalWork kayıtlarını bul
		const dentalWorksWithoutPrices = await ctx.db.dentalWork.findMany({
			where: {
				OR: [{ unitPrice: null }, { totalPrice: null }],
				isDeleted: false,
			},
			include: {
				prosthesisType: true,
				dentist: {
					include: {
						clinic: true,
					},
				},
			},
		});

		let updatedCount = 0;

		for (const dentalWork of dentalWorksWithoutPrices) {
			try {
				// O zamanki fiyatı hesapla
				const clinicPrice = await ctx.db.clinicProsthesisPrice.findUnique({
					where: {
						clinicId_prosthesisTypeId: {
							clinicId: dentalWork.dentist.clinic.id,
							prosthesisTypeId: dentalWork.prosthesisTypeId,
						},
					},
				});

				const unitPrice = clinicPrice?.price || dentalWork.prosthesisType.defaultPrice || 0;
				const totalPrice = unitPrice * (dentalWork.selectedTeeth?.length || 1);

				// DentalWork'ü güncelle
				await ctx.db.dentalWork.update({
					where: { id: dentalWork.id },
					data: {
						unitPrice: unitPrice,
						totalPrice: totalPrice,
					},
				});

				updatedCount++;
			} catch (error) {
				console.error(`DentalWork ${dentalWork.id} güncellenirken hata:`, error);
			}
		}

		return {
			message: `${updatedCount} adet DentalWork kaydının fiyatları güncellendi`,
			updatedCount,
			totalFound: dentalWorksWithoutPrices.length,
		};
	}),
});
