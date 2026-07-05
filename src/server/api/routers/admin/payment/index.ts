import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const paymentRouter = createTRPCRouter({
	getClinicPaymentSummary: adminProcedure.query(async ({ ctx }) => {
		const clinics = await ctx.db.clinic.findMany({
			where: {
				isDeleted: false,
			},
			include: {
				incomes: {
					where: {
						isDeleted: false,
					},
					select: {
						amount: true,
					},
				},
				dentists: {
					where: {
						isDeleted: false,
					},
					include: {
						   dentalWorks: {
							   where: {
								   isDeleted: false,
								   patient: {
									   // @ts-ignore - Patient isCompleted field exists but TS types not updated
									   isCompleted: true,
								   },
							   },
							   select: {
								   totalPrice: true,
								   unitPrice: true,
								   dentalWorkAdditionalTreatments: {
									   select: {
										   price: true,
										   quantity: true,
									   },
								   },
							   },
						   },
					},
				},
			},
		});

		const summary = clinics.map((clinic) => {
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			const totalDebt = clinic.dentists.reduce((clinicSum, dentist) => {
				return (
					clinicSum +
					// @ts-ignore - Temporary ignore due to Prisma type sync issues
					dentist.dentalWorks.reduce((dentistSum, work) => {
						let workTotal = Number(work.totalPrice || work.unitPrice || 0);
						if (work.dentalWorkAdditionalTreatments?.length) {
							workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
								const price = Number(add.price) || 0;
								const quantity = add.quantity || 1;
								return addSum + price;
							}, 0);
						}
						return dentistSum + workTotal;
					}, 0)
				);
			}, 0);

			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			const totalReceived = clinic.incomes.reduce((sum, income) => {
				return sum + Number(income.amount);
			}, 0);

			const remainingDebt = totalDebt - totalReceived; // Math.max kaldırıldı

			return {
				id: clinic.id,
				name: clinic.name,
				totalDebt,
				totalReceived,
				remainingDebt,
				paymentRate: totalDebt > 0 ? Math.round((totalReceived / totalDebt) * 100) : 0,
				// @ts-ignore - Temporary ignore due to Prisma type sync issues
				dentistCount: clinic.dentists.length,
			};
		});

		return summary.sort((a, b) => {
			// Önce borçluları (pozitif) büyükten küçüğe, sonra alacaklıları (negatif) küçükten büyüğe
			if (a.remainingDebt > 0 && b.remainingDebt <= 0) return -1; // a borçlu, b alacaklı/borçsuz
			if (a.remainingDebt <= 0 && b.remainingDebt > 0) return 1; // a alacaklı/borçsuz, b borçlu
			return b.remainingDebt - a.remainingDebt; // Aynı kategori içinde sıralama
		});
	}),

	getClinicPaymentDetail: adminProcedure.input(z.object({ clinicId: z.string() })).query(async ({ ctx, input }) => {
		const clinic = await ctx.db.clinic.findUnique({
			where: {
				id: input.clinicId,
				isDeleted: false,
			},
			include: {
				incomes: {
					where: {
						isDeleted: false,
					},
					include: {
						createdBy: {
							select: {
								name: true,
							},
						},
						dentist: {
							include: {
								user: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						date: "desc",
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
						   dentalWorks: {
							   where: {
								   isDeleted: false,
								   patient: {
									   // @ts-ignore - Patient isCompleted field exists but TS types not updated
									   isCompleted: true,
								   },
							   },
							   include: {
								   patient: {
									   select: {
										   name: true,
									   },
								   },
								   prosthesisType: {
									   select: {
										   name: true,
									   },
								   },
								   prosthesisStage: {
									   select: {
										   name: true,
										   percentage: true,
									   },
								   },
								   dentalWorkAdditionalTreatments: {
									   include: {
										   additionalTreatment: true,
									   },
								   },
							   },
							   orderBy: {
								   createdAt: "desc",
							   },
						   },
					},
				},
			},
		});

		if (!clinic) {
			throw new Error("Klinik bulunamadı");
		}

		// @ts-ignore - Temporary ignore due to Prisma type sync issues
		const totalDebt = clinic.dentists.reduce((clinicSum, dentist) => {
			return (
				clinicSum +
				dentist.dentalWorks.reduce((dentistSum, work) => {
					let workTotal = Number(work.totalPrice || work.unitPrice || 0);
					if (work.dentalWorkAdditionalTreatments?.length) {
						workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
							const price = Number(add.price) || 0;
							return addSum + price;
						}, 0);
					}
					return dentistSum + workTotal;
				}, 0)
			);
		}, 0);

		// @ts-ignore - Temporary ignore due to Prisma type sync issues
		const totalReceived = clinic.incomes.reduce((sum, income) => {
			return sum + Number(income.amount);
		}, 0);

		const remainingDebt = totalDebt - totalReceived; // Math.max kaldırıldı

		// @ts-ignore - Temporary ignore due to Prisma type sync issues
		const dentistSummaries = clinic.dentists.map((dentist) => {
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			const dentistDebt = dentist.dentalWorks.reduce((sum, work) => {
				let workTotal = Number(work.totalPrice || work.unitPrice || 0);
				if (work.dentalWorkAdditionalTreatments?.length) {
					workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
						const price = Number(add.price) || 0;
						return addSum + price;
					}, 0);
				}
				return sum + workTotal;
			}, 0);

			// Hekime ait ödemeleri hesapla
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			const dentistIncomes = clinic.incomes.filter((income) => income.dentistId === dentist.id);

			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			const dentistTotalReceived = dentistIncomes.reduce((sum, income) => {
				return sum + Number(income.amount);
			}, 0);

			const dentistRemainingDebt = dentistDebt - dentistTotalReceived; // Math.max kaldırıldı
			const dentistPaymentRate = dentistDebt > 0 ? Math.round((dentistTotalReceived / dentistDebt) * 100) : 0;

			return {
				id: dentist.id,
				name: dentist.user.name,
				totalDebt: dentistDebt,
				totalReceived: dentistTotalReceived,
				remainingDebt: dentistRemainingDebt,
				paymentRate: dentistPaymentRate,
				workCount: dentist.dentalWorks.length,
				dentalWorks: dentist.dentalWorks,
			};
		});

		return {
			clinic: {
				id: clinic.id,
				name: clinic.name,
			},
			summary: {
				totalDebt,
				totalReceived,
				remainingDebt,
				paymentRate: totalDebt > 0 ? Math.round((totalReceived / totalDebt) * 100) : 0,
			},
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			dentistSummaries: dentistSummaries.sort((a, b) => b.totalDebt - a.totalDebt),
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			incomes: clinic.incomes,
		};
	}),

	getDentistPaymentDetail: adminProcedure.input(z.object({ dentistId: z.string() })).query(async ({ ctx, input }) => {
		const dentist = await ctx.db.dentist.findUnique({
			where: {
				id: input.dentistId,
				isDeleted: false,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
				clinic: {
					select: {
						name: true,
					},
				},
				   dentalWorks: {
					   where: {
						   isDeleted: false,
						   patient: {
							   // @ts-ignore - Patient isCompleted field exists but TS types not updated
							   isCompleted: true,
						   },
					   },
					   include: {
						   patient: {
							   select: {
								   name: true,
							   },
						   },
						   prosthesisType: {
							   select: {
								   name: true,
							   },
						   },
						   prosthesisStage: {
							   select: {
								   name: true,
								   percentage: true,
							   },
						   },
						   dentalWorkAdditionalTreatments: {
							   include: {
								   additionalTreatment: true,
							   },
						   },
					   },
					   orderBy: {
						   createdAt: "desc",
					   },
				   },
				incomes: {
					where: {
						isDeleted: false,
					},
					include: {
						createdBy: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						date: "desc",
					},
				},
			},
		});

		if (!dentist) {
			throw new Error("Hekim bulunamadı");
		}

		// @ts-ignore - Temporary ignore due to Prisma type sync issues
		const totalDebt = dentist.dentalWorks.reduce((sum, work) => {
			let workTotal = Number(work.totalPrice || work.unitPrice || 0);
			if (work.dentalWorkAdditionalTreatments?.length) {
				workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum, add) => {
					const price = Number(add.price) || 0;
					return addSum + price;
				}, 0);
			}
			return sum + workTotal;
		}, 0);

		// @ts-ignore - Temporary ignore due to Prisma type sync issues
		const totalReceived = dentist.incomes.reduce((sum, income) => {
			return sum + Number(income.amount);
		}, 0);

		const remainingDebt = Math.max(0, totalDebt - totalReceived);

		return {
			dentist: {
				id: dentist.id,
				// @ts-ignore - Temporary ignore due to Prisma type sync issues
				name: dentist.user.name,
				// @ts-ignore - Temporary ignore due to Prisma type sync issues
				email: dentist.user.email,
				// @ts-ignore - Temporary ignore due to Prisma type sync issues
				phone: dentist.user.phone,
				// @ts-ignore - Temporary ignore due to Prisma type sync issues
				clinicName: dentist.clinic.name,
			},
			summary: {
				totalDebt,
				totalReceived,
				remainingDebt,
				paymentRate: totalDebt > 0 ? Math.round((totalReceived / totalDebt) * 100) : 0,
			},
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			dentalWorks: dentist.dentalWorks,
			// @ts-ignore - Temporary ignore due to Prisma type sync issues
			incomes: dentist.incomes,
		};
	}),

	transferDebt: adminProcedure
		.input(
			z.object({
				fromDentistId: z.string(),
				toDentistId: z.string(),
				amount: z.number().positive(),
				clinicId: z.string(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { fromDentistId, toDentistId, amount, clinicId, description } = input;

			// Aynı hekime aktarım yapılamaz
			if (fromDentistId === toDentistId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Aynı hekime borç aktarımı yapılamaz",
				});
			}

			// Her iki hekimi de kontrol et
			const [fromDentist, toDentist] = await Promise.all([
				ctx.db.dentist.findUnique({
					where: { id: fromDentistId, isDeleted: false, clinicId },
					include: {
						user: { select: { name: true } },
						dentalWorks: {
							where: {
								isDeleted: false,
								patient: { isCompleted: true },
							},
							select: { totalPrice: true, unitPrice: true },
						},
						incomes: {
							where: { isDeleted: false },
							select: { amount: true },
						},
					},
				}),
				ctx.db.dentist.findUnique({
					where: { id: toDentistId, isDeleted: false, clinicId },
					include: {
						user: { select: { name: true } },
						dentalWorks: {
							where: {
								isDeleted: false,
								patient: { isCompleted: true },
							},
							select: { totalPrice: true, unitPrice: true },
						},
						incomes: {
							where: { isDeleted: false },
							select: { amount: true },
						},
					},
				}),
			]);

			if (!fromDentist || !toDentist) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Hekim bulunamadı",
				});
			}

			// Borç hesaplamaları
					const calculateDebt = (dentist: any) => {
						const totalDebt = dentist.dentalWorks.reduce((sum: number, work: any) => {
							let workTotal = Number(work.totalPrice || work.unitPrice || 0);
							if (work.dentalWorkAdditionalTreatments?.length) {
								workTotal += work.dentalWorkAdditionalTreatments.reduce((addSum: number, add: any) => {
									const price = Number(add.price) || 0;
									return addSum + price;
								}, 0);
							}
							return sum + workTotal;
						}, 0);
						const totalReceived = dentist.incomes.reduce((sum: number, income: any) => {
							return sum + Number(income.amount);
						}, 0);
						return totalDebt - totalReceived; // Negatif değer alacak anlamına gelir
					};

			const fromDentistDebt = calculateDebt(fromDentist);
			const toDentistDebt = calculateDebt(toDentist);

			// Transfer kuralları kontrolü
			if (fromDentistDebt > 0) {
				// Aktaran hekim borçlu ise, borç miktarından fazla aktaramaz
				if (amount > fromDentistDebt) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Aktarılabilir maksimum tutar: ${fromDentistDebt.toLocaleString('tr-TR', {
							style: 'currency',
							currency: 'TRY',
						})}`,
					});
				}
			} else if (fromDentistDebt < 0) {
				// Aktaran hekim alacaklı ise (negatif borç), hedef hekimden borç silebilir
				const maxTransferable = Math.abs(fromDentistDebt);
				if (amount > maxTransferable) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Silinebilir maksimum tutar: ${maxTransferable.toLocaleString('tr-TR', {
							style: 'currency',
							currency: 'TRY',
						})}`,
					});
				}

				// Hedef hekimden silinecek borç, mevcut borçtan fazla olamaz (eğer pozitifse)
				if (toDentistDebt > 0 && amount > toDentistDebt) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Hedef hekimin toplam borcu: ${toDentistDebt.toLocaleString('tr-TR', {
							style: 'currency',
							currency: 'TRY',
						})}. Bu miktardan fazla borç silinemez.`,
					});
				}
			} else {
				// fromDentistDebt === 0
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Borçsuz hekimden borç aktarımı yapılamaz",
				});
			}

			// Transaction ile borç aktarımı
			const result = await ctx.db.$transaction(async (tx) => {
				const currentDate = new Date();
				const userId = ctx.session?.user?.id;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Kullanıcı oturumu bulunamadı",
					});
				}

				if (fromDentistDebt > 0) {
					// Scenario 1: Borçlu hekimden borç aktarımı
					// Aktaran hekimin borcunu azalt (ödeme ekle)
					await tx.income.create({
						data: {
							amount: amount,
							date: currentDate,
							description: description || `${toDentist.user.name} adına borç aktarımı`,
							dentistId: fromDentistId,
							clinicId: clinicId,
							createdById: userId,
							paymentType: "CASH", // Borç aktarımı için CASH kullanıyoruz
						},
					});

					// Hedef hekimin borcunu artır (negatif ödeme ekle)
					await tx.income.create({
						data: {
							amount: -amount, // Negatif tutar = borç artışı
							date: currentDate,
							description: description || `${fromDentist.user.name} adından borç devri`,
							dentistId: toDentistId,
							clinicId: clinicId,
							createdById: userId,
							paymentType: "CASH",
						},
					});
				} else {
					// Scenario 2: Alacaklı hekimden borç silme
					// Aktaran hekimin alacağını azalt (negatif ödeme ekle)
					await tx.income.create({
						data: {
							amount: -amount, // Alacak azaltma
							date: currentDate,
							description: description || `${toDentist.user.name} için borç silme`,
							dentistId: fromDentistId,
							clinicId: clinicId,
							createdById: userId,
							paymentType: "CASH",
						},
					});

					// Hedef hekimin borcunu azalt (pozitif ödeme ekle)
					await tx.income.create({
						data: {
							amount: amount, // Borç azaltma
							date: currentDate,
							description: description || `${fromDentist.user.name} tarafından borç silindi`,
							dentistId: toDentistId,
							clinicId: clinicId,
							createdById: userId,
							paymentType: "CASH",
						},
					});
				}

				return {
					success: true,
					fromDentist: fromDentist.user.name,
					toDentist: toDentist.user.name,
					amount,
					type: fromDentistDebt > 0 ? 'debt_transfer' : 'debt_forgiveness',
				};
			});

			return result;
		}),
});
