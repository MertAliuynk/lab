"use client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SelectJaws from "./select-jaws";
import SelectProsthesisColor from "./select-prosthesis-color";
import SelectProsthesisStage from "./select-prosthesis-stage";

interface EditProsthesisSheetProps {
	dentalWorkId: string;
	children: React.ReactNode;
	isAdmin?: boolean;
}

const formSchema = z.object({
	selectedTeeth: z.array(z.string()).optional(),
	selectedJaws: z.array(z.string()).optional(),
	toothColorId: z.string().min(1, "Diş rengi seçmelisiniz"),
	prosthesisStageId: z.string().min(1, "Protez aşaması seçmelisiniz"),
	notes: z.string().optional(),
});

export default function EditProsthesisSheet({ dentalWorkId, children, isAdmin }: EditProsthesisSheetProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const { mutateAsync: updateDentalWork, isPending } = isAdmin
		? api.admin.dentalWork.update.useMutation()
		: api.dentist.dentalWork.update.useMutation();
	const { data: dentalWork } = isAdmin
		? api.admin.dentalWork.getById.useQuery({ id: dentalWorkId }, { enabled: !!dentalWorkId && open })
		: api.dentist.dentalWork.getById.useQuery({ dentalWorkId }, { enabled: !!dentalWorkId && open });

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			selectedTeeth: [],
			selectedJaws: [],
			toothColorId: "",
			prosthesisStageId: "",
			notes: "",
		},
	});

	const { data: prosthesisTypes } = api.admin.prosthesisType.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	useEffect(() => {
		if (dentalWork && open) {
			form.setValue("selectedTeeth", dentalWork.selectedTeeth || []);
			form.setValue("selectedJaws", dentalWork.selectedJaws || []);
			form.setValue("toothColorId", dentalWork.toothColorId || "");
			form.setValue("prosthesisStageId", dentalWork.prosthesisStageId || "");
			form.setValue("notes", dentalWork.notes || "");
		}
	}, [dentalWork, open, form]);

	const selectedProsthesisType = prosthesisTypes?.find((type) => type.id === dentalWork?.prosthesisTypeId);
	const isPricingJawBased = selectedProsthesisType?.pricingType === "JAW_BASED";

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			if (isAdmin) {
				await updateDentalWork({
					dentalWorkId,
					selectedTeeth: values.selectedTeeth,
					selectedJaws: values.selectedJaws,
					toothColorId: values.toothColorId,
					prosthesisStageId: values.prosthesisStageId,
					notes: values.notes,
				});
			} else {
				await updateDentalWork({
					dentalWorkId,
					selectedTeeth: values.selectedTeeth,
					selectedJaws: values.selectedJaws,
					toothColorId: values.toothColorId,
					prosthesisStageId: values.prosthesisStageId,
					notes: values.notes,
				});
			}
			toast.success("Protez işlemi başarıyla güncellendi");
			setOpen(false);
			router.refresh();
		} catch {
			toast.error("Protez işlemi güncellenirken bir hata oluştu");
		}
	};

	const teeth = [
		{ id: 18, label: "18" },
		{ id: 17, label: "17" },
		{ id: 16, label: "16" },
		{ id: 15, label: "15" },
		{ id: 14, label: "14" },
		{ id: 13, label: "13" },
		{ id: 12, label: "12" },
		{ id: 11, label: "11" },
		{ id: 21, label: "21" },
		{ id: 22, label: "22" },
		{ id: 23, label: "23" },
		{ id: 24, label: "24" },
		{ id: 25, label: "25" },
		{ id: 26, label: "26" },
		{ id: 27, label: "27" },
		{ id: 28, label: "28" },
		{ id: 48, label: "48" },
		{ id: 47, label: "47" },
		{ id: 46, label: "46" },
		{ id: 45, label: "45" },
		{ id: 44, label: "44" },
		{ id: 43, label: "43" },
		{ id: 42, label: "42" },
		{ id: 41, label: "41" },
		{ id: 31, label: "31" },
		{ id: 32, label: "32" },
		{ id: 33, label: "33" },
		{ id: 34, label: "34" },
		{ id: 35, label: "35" },
		{ id: 36, label: "36" },
		{ id: 37, label: "37" },
		{ id: 38, label: "38" },
	];

	const selectedTeeth = form.watch("selectedTeeth") || [];

	const upperLeftTeeth = teeth.filter((tooth) => tooth.id >= 11 && tooth.id <= 18);
	const upperRightTeeth = teeth.filter((tooth) => tooth.id >= 21 && tooth.id <= 28);
	const lowerLeftTeeth = teeth.filter((tooth) => tooth.id >= 41 && tooth.id <= 48);
	const lowerRightTeeth = teeth.filter((tooth) => tooth.id >= 31 && tooth.id <= 38);

	const isToothSelected = (toothId: number) => selectedTeeth.includes(toothId.toString());

	const handleToothClick = (toothId: number) => {
		const toothIdStr = toothId.toString();
		let newSelectedTeeth: string[];

		if (isToothSelected(toothId)) {
			newSelectedTeeth = selectedTeeth.filter((id) => id !== toothIdStr);
		} else {
			newSelectedTeeth = [...selectedTeeth, toothIdStr];
		}

		form.setValue("selectedTeeth", newSelectedTeeth, { shouldValidate: true });
	};

	const renderToothRow = (leftTeeth: typeof teeth, rightTeeth: typeof teeth) => {
		return (
			<div className="flex justify-center items-center gap-2">
				<div className="flex gap-1">
					{leftTeeth.reverse().map((tooth) => (
						<button
							key={tooth.id}
							type="button"
							onClick={() => handleToothClick(tooth.id)}
							className={cn(
								"w-8 h-8 text-xs font-medium border border-gray-300 rounded-md transition-colors",
								"hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
								isToothSelected(tooth.id)
									? "bg-blue-500 text-white border-blue-500"
									: "bg-white text-gray-700 hover:bg-blue-50",
							)}
							aria-label={`Diş ${tooth.label} ${isToothSelected(tooth.id) ? "seçili" : "seçili değil"}`}
						>
							{tooth.label}
						</button>
					))}
				</div>

				<div className="w-4 h-1 bg-gray-300 mx-2" />

				<div className="flex gap-1">
					{rightTeeth.map((tooth) => (
						<button
							key={tooth.id}
							type="button"
							onClick={() => handleToothClick(tooth.id)}
							className={cn(
								"w-8 h-8 text-xs font-medium border border-gray-300 rounded-md transition-colors",
								"hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
								isToothSelected(tooth.id)
									? "bg-blue-500 text-white border-blue-500"
									: "bg-white text-gray-700 hover:bg-blue-50",
							)}
							aria-label={`Diş ${tooth.label} ${isToothSelected(tooth.id) ? "seçili" : "seçili değil"}`}
						>
							{tooth.label}
						</button>
					))}
				</div>
			</div>
		);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="min-w-2xl max-h-screen overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Edit className="w-5 h-5" />
						Protez İşlemini Düzenle
					</SheetTitle>
					<SheetDescription>
						Mevcut protez işlemine diş ekleyebilir veya diğer özellikleri güncelleyebilirsiniz.
					</SheetDescription>
				</SheetHeader>
				{dentalWork && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
							<div className="bg-blue-50 p-4 rounded-lg">
								<h4 className="font-medium text-blue-900 mb-2">Mevcut Protez Bilgileri</h4>
								<div className="space-y-1 text-sm text-blue-700">
									<p>
										<strong>Protez Tipi:</strong> {dentalWork.prosthesisType.name}
									</p>
									<p>
										<strong>Hasta:</strong> {dentalWork.patient.name}
									</p>
									<p>
										<strong>Oluşturma Tarihi:</strong> {formatDate(dentalWork.createdAt)}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{isPricingJawBased ? (
									<div>
										<p className="text-sm font-medium mb-2">Çene Seçimi</p>
										<SelectJaws groupIndex="edit" />
										<FormField
											control={form.control}
											name="selectedJaws"
											render={() => (
												<FormItem>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								) : (
									<FormField
										control={form.control}
										name="selectedTeeth"
										render={() => (
											<FormItem>
												<FormLabel>Dişler</FormLabel>
												<div className="space-y-4">
													<div className="mb-4">
														<p className="text-xs text-gray-500 mb-2 text-center">Üst Çene</p>
														{renderToothRow(upperLeftTeeth, upperRightTeeth)}
													</div>

													<div className="mb-4">
														<p className="text-xs text-gray-500 mb-2 text-center">Alt Çene</p>
														{renderToothRow(lowerLeftTeeth, lowerRightTeeth)}
													</div>

													{selectedTeeth.length > 0 && (
														<p className="text-sm text-gray-600 mt-2">
															Seçili dişler:{" "}
															{selectedTeeth
																.map((t) => Number(t))
																.sort((a, b) => a - b)
																.join(", ")}{" "}
															({selectedTeeth.length} diş)
														</p>
													)}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<FormField
									control={form.control}
									name="prosthesisStageId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Protez Aşaması</FormLabel>
											<FormControl>
												<SelectProsthesisStage {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="toothColorId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Diş Rengi</FormLabel>
											<FormControl>
												<SelectProsthesisColor {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>İşlem Notları</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Bu protez işlemi hakkında notlarınızı yazabilirsiniz..."
													className="min-h-[80px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex gap-2">
								<Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
									İptal
								</Button>
								<Button type="submit" loading={isPending} className="flex-1">
									Güncelle
								</Button>
							</div>
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
