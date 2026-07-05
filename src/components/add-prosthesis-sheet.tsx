"use client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ClipboardPlus, Edit, Plus, Trash2 } from "lucide-react";
import FileUploadArea from "./file-upload-area";
import ToothGroupDialog from "./tooth-group-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SelectPatient from "./select-patient";
import SelectProsthesisColor from "./select-prosthesis-color";
import { useProsthesisSheet } from "@/contexts/prosthesis-sheet-context";

interface ToothGroup {
	id: string;
	selectedTeeth: number[];
	selectedJaws: string[];
	prosthesisType: string;
	prosthesisStage: string;
	notes?: string;
}

interface UploadedFile {
	url: string;
	name: string;
	type: "image" | "video";
}

const formSchema = z
	.object({
		patientId: z.string().optional(),
		patientName: z.string().optional(),
		toothColor: z.string().min(1, "Diş rengi seçmelisiniz"),
		notes: z.string().optional(),
		files: z
			.array(
				z.object({
					url: z.string(),
					name: z.string(),
					type: z.enum(["image", "video"]),
				}),
			)
			.optional(),
		tempGroup: z
			.object({
				selectedTeeth: z.array(z.number()).optional(),
				selectedJaws: z.array(z.string()).optional(),
				prosthesisType: z.string().optional(),
				prosthesisStage: z.string().optional(),
			})
			.optional(),
		editingGroup: z
			.object({
				id: z.string(),
				selectedTeeth: z.array(z.number()).optional(),
				selectedJaws: z.array(z.string()).optional(),
				prosthesisType: z.string().optional(),
				prosthesisStage: z.string().optional(),
			})
			.optional(),
	})
	.refine((data) => data.patientId || (data.patientName && data.patientName.trim().length > 0), {
		message: "Mevcut hasta seçin veya yeni hasta adı girin",
		path: ["patientId"],
	});

export default function AddProsthesisSheet() {
	const router = useRouter();
	const utils = api.useUtils();
	const { isOpen, patientId: contextPatientId, closeSheet } = useProsthesisSheet();
	const { mutateAsync: createDentalWork, isPending } = api.dentist.dentalWork.create.useMutation();
	const { data: prosthesisTypes } = api.admin.prosthesisType.getAll.useQuery({ page: 1, perPage: 100 });
	const { data: prosthesisStages } = api.admin.prosthesisStage.getAll.useQuery({ page: 1, perPage: 100 });
	const { data: favoriteProsthesisTypes = [], isLoading: favoritesLoading } = 
		api.dentist.favoriteProsthesisType.getAll.useQuery();
	const [toothGroups, setToothGroups] = useState<ToothGroup[]>([]);
	const [usedProsthesisTypes, setUsedProsthesisTypes] = useState<string[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			patientId: contextPatientId || "",
			patientName: "",
			notes: "",
			files: [],
			tempGroup: {
				selectedTeeth: [],
				selectedJaws: [],
				prosthesisType: "",
				prosthesisStage: "",
			},
			editingGroup: {
				id: "",
				selectedTeeth: [],
				selectedJaws: [],
				prosthesisType: "",
				prosthesisStage: "",
			},
		},
	});

	const selectedPatientId = form.watch("patientId");

	const { data: existingDentalWorks } = api.dentist.dentalWork.getByPatientId.useQuery(
		{ patientId: selectedPatientId || "" },
		{ enabled: !!selectedPatientId },
	);

	// Context'ten gelen patientId'yi form'a set et
	useEffect(() => {
		if (contextPatientId) {
			form.setValue("patientId", contextPatientId);
		}
	}, [contextPatientId, form]);

	useEffect(() => {
		if (existingDentalWorks) {
			const existingTypes = [...new Set(existingDentalWorks.map((work) => work.prosthesisTypeId))];
			const currentGroupTypes = toothGroups.map((group) => group.prosthesisType);
			setUsedProsthesisTypes([...existingTypes, ...currentGroupTypes]);
		} else {
			const currentGroupTypes = toothGroups.map((group) => group.prosthesisType);
			setUsedProsthesisTypes(currentGroupTypes);
		}
	}, [existingDentalWorks, toothGroups]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (toothGroups.length === 0) {
			toast.error("En az bir diş grubu oluşturmalısınız");
			return;
		}

		try {
			let finalPatientId = values.patientId;

			if (!finalPatientId && values.patientName) {
				const firstGroup = toothGroups[0];
				if (!firstGroup) {
					toast.error("İlk protez bulunamadı");
					return;
				}

				const firstDentalWork = await createDentalWork({
					patientName: values.patientName,
					prosthesisTypeId: firstGroup.prosthesisType,
					prosthesisStageId: firstGroup.prosthesisStage,
					toothColorId: values.toothColor,
					selectedTeeth: firstGroup.selectedTeeth.map(String),
					selectedJaws: firstGroup.selectedJaws,
					notes: values.notes,
					attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
				});

				finalPatientId = firstDentalWork.patientId;

				for (let i = 1; i < toothGroups.length; i++) {
					const group = toothGroups[i];
					if (group) {
						await createDentalWork({
							patientId: finalPatientId,
							prosthesisTypeId: group.prosthesisType,
							prosthesisStageId: group.prosthesisStage,
							toothColorId: values.toothColor,
							selectedTeeth: group.selectedTeeth.map(String),
							selectedJaws: group.selectedJaws,
							notes: values.notes,
							attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
						});
					}
				}
			} else {
				for (const group of toothGroups) {
					await createDentalWork({
						patientId: finalPatientId,
						prosthesisTypeId: group.prosthesisType,
						prosthesisStageId: group.prosthesisStage,
						toothColorId: values.toothColor,
						selectedTeeth: group.selectedTeeth.map(String),
						selectedJaws: group.selectedJaws,
						notes: values.notes,
						attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
					});
				}
			}

			toast.success("Protez başarıyla eklendi");
			form.reset();
			setToothGroups([]);
			setUploadedFiles([]);
			closeSheet();

			await utils.invalidate();
			router.refresh();
		} catch {
			toast.error("Protez eklenirken bir hata oluştu");
		}
	};

	const handleAddGroup = (group: Omit<ToothGroup, "id">) => {
		const newGroup: ToothGroup = {
			id: `group-${Date.now()}-${Math.random()}`,
			...group,
		};
		setToothGroups([...toothGroups, newGroup]);
		toast.success("Protez başarıyla eklendi");
	};

	const handleUpdateGroup = (index: number) => (updatedGroup: Omit<ToothGroup, "id">) => {
		const updatedGroups = [...toothGroups];
		const existingGroup = updatedGroups[index];
		if (existingGroup) {
			updatedGroups[index] = {
				...existingGroup,
				...updatedGroup,
			};
			setToothGroups(updatedGroups);
			toast.success("Protez başarıyla güncellendi");
		}
	};

	const handleRemoveGroup = (index: number) => {
		setToothGroups(toothGroups.filter((_, i) => i !== index));
		toast.success("Protez silindi");
	};

	const formatTeethList = (teeth: number[]) => {
		return teeth.sort((a, b) => a - b).join(", ");
	};

	const formatJawsList = (jaws: string[]) => {
		return jaws.map((jaw) => (jaw === "UPPER" ? "Üst Çene" : "Alt Çene")).join(", ");
	};

	const getSelectedTeeth = () => {
		return toothGroups.reduce((acc: number[], group) => {
			return acc.concat(group.selectedTeeth);
		}, []);
	};

	const getSelectedTeethExcludingGroup = (excludeIndex: number) => {
		return toothGroups.reduce((acc: number[], group, index) => {
			if (index !== excludeIndex) {
				return acc.concat(group.selectedTeeth);
			}
			return acc;
		}, []);
	};

	const getUsedTypesExcludingGroup = (excludeIndex: number) => {
		if (existingDentalWorks) {
			const existingTypes = [...new Set(existingDentalWorks.map((work) => work.prosthesisTypeId))];
			const currentGroupTypes = toothGroups
				.filter((_, index) => index !== excludeIndex)
				.map((group) => group.prosthesisType);
			return [...existingTypes, ...currentGroupTypes];
		}

		const currentGroupTypes = toothGroups
			.filter((_, index) => index !== excludeIndex)
			.map((group) => group.prosthesisType);
		return currentGroupTypes;
	};

	const getProsthesisTypeName = (id: string) => {
		return prosthesisTypes?.find((type) => type.id === id)?.name || "Belirtilmedi";
	};

	const getProsthesisStageName = (id: string) => {
		return prosthesisStages?.find((stage) => stage.id === id)?.name || "Belirtilmedi";
	};

	return (
		   <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
			<SheetContent className="min-w-2xl max-h-screen overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Protez Ekle</SheetTitle>
					<SheetDescription>
						Hastanız için protez planlaması yapın. Dişleri seçin ve protez tipini belirleyin.
					</SheetDescription>
				</SheetHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="patientId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mevcut Hasta Seçin</FormLabel>
										<FormControl>
											<SelectPatient {...field} userType="dentist" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="text-center text-sm text-muted-foreground">veya</div>

							<FormField
								control={form.control}
								name="patientName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Yeni Hasta Adı</FormLabel>
										<FormControl>
											<Input placeholder="Yeni hasta adını giriniz" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Protez Grupları ({toothGroups.length})</h3>
								<ToothGroupDialog
									onGroupConfirm={handleAddGroup}
									disabledTeeth={getSelectedTeeth()}
									excludeTypes={usedProsthesisTypes}
								>
									<Button type="button" variant="outline" size="sm">
										<Plus className="h-4 w-4 mr-2" />
										Diş Seç
									</Button>
								</ToothGroupDialog>
							</div>

							{toothGroups.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
									<Plus className="mx-auto h-12 w-12 mb-4 opacity-50" />
									<p>Henüz grup oluşturulmadı</p>
									<p className="text-sm">Diş Seç butonunu kullanarak başlayın</p>
								</div>
							) : (
								<div className="space-y-3 max-h-60 overflow-y-auto">
									{toothGroups.map((group, index) => (
										<Card key={group.id} className="relative rounded-none bg-sidebar">
											<CardHeader>
												<div className="flex items-center justify-between">
													<CardTitle className="text-base">Protez {index + 1}</CardTitle>
													<div className="flex items-center gap-2">
														<ToothGroupDialog
															key={`edit-${group.id}`}
															onGroupConfirm={handleUpdateGroup(index)}
															disabledTeeth={getSelectedTeethExcludingGroup(index)}
															excludeTypes={getUsedTypesExcludingGroup(index)}
															initialData={{
																selectedTeeth: group.selectedTeeth,
																selectedJaws: group.selectedJaws,
																prosthesisType: group.prosthesisType,
																prosthesisStage: group.prosthesisStage,
															}}
														>
															<Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0">
																<Edit className="h-4 w-4" />
															</Button>
														</ToothGroupDialog>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => handleRemoveGroup(index)}
															className="h-8 w-8 p-0 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="grid grid-cols-3 gap-2">
												<div>
													<span className="text-sm font-medium">Seçili Dişler:</span>
													<p className="text-sm text-muted-foreground break-words">
														{group.selectedJaws.length > 0
															? formatJawsList(group.selectedJaws)
															: formatTeethList(group.selectedTeeth)}
													</p>
												</div>

												<div>
													<span className="text-sm font-medium">Protez Tipi:</span>
													<p className="text-sm text-muted-foreground mt-1">
														{getProsthesisTypeName(group.prosthesisType)}
													</p>
												</div>

												<div>
													<span className="text-sm font-medium">Protez Aşaması:</span>
													<p className="text-sm text-muted-foreground mt-1">
														{getProsthesisStageName(group.prosthesisStage)}
													</p>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{toothGroups.length > 0 && (
								<div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
									<p>Toplam {toothGroups.length} protez oluşturuldu</p>
									<p>Toplam {toothGroups.reduce((sum, group) => sum + group.selectedTeeth.length, 0)} diş seçildi</p>
								</div>
							)}
						</div>

						<FormField
							control={form.control}
							name="toothColor"
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

						<FormField
							control={form.control}
							name="files"
							render={() => (
								<FormItem>
									<FormLabel>Fotoğraf ve Video</FormLabel>
									<FormControl>
										<FileUploadArea
											onFilesChange={(files) => {
												setUploadedFiles(files);
												form.setValue("files", files);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" loading={isPending} disabled={toothGroups.length === 0}>
							Onayla
						</Button>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
