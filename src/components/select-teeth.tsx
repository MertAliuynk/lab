import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectJaws from "./select-jaws";
import SelectProsthesisStage from "./select-prosthesis-stage";
import SelectProsthesisType from "./select-prosthesis-type";

interface SelectTeethProps {
	groupIndex: number | string;
	disabledTeeth?: number[];
	excludeTypes?: string[];
}

export default function SelectTeeth({ groupIndex, disabledTeeth = [], excludeTypes = [] }: SelectTeethProps) {
	const form = useFormContext();

	const basePath = typeof groupIndex === "string" ? groupIndex : `prosthesisGroups.${groupIndex}`;
	const teethPath = `${basePath}.selectedTeeth`;
	const prosthesisTypePath = `${basePath}.prosthesisType`;
	const prosthesisStagePath = `${basePath}.prosthesisStage`;

	const [selectedTeeth, setSelectedTeeth] = useState<number[]>(() => {
		return form.getValues(teethPath) || [];
	});
	const [selectedProsthesisTypeId, setSelectedProsthesisTypeId] = useState<string>("");

	const { data: prosthesisTypes } = api.admin.prosthesisType.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	const selectedProsthesisType = prosthesisTypes?.find((type) => type.id === selectedProsthesisTypeId);
	const isPricingJawBased = selectedProsthesisType?.pricingType === "JAW_BASED";

	const upperLeftTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
	const upperRightTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
	const lowerLeftTeeth = [48, 47, 46, 45, 44, 43, 42, 41];
	const lowerRightTeeth = [31, 32, 33, 34, 35, 36, 37, 38];

	const handleToothClick = useCallback(
		(toothNumber: number) => {
			if (disabledTeeth.includes(toothNumber)) {
				return;
			}

			const currentSelected = [...selectedTeeth];

			if (currentSelected.includes(toothNumber)) {
				const updatedSelected = currentSelected.filter((tooth: number) => tooth !== toothNumber);
				setSelectedTeeth(updatedSelected);
				form.setValue(teethPath, updatedSelected);
			} else {
				const updatedSelected = [...currentSelected, toothNumber];
				setSelectedTeeth(updatedSelected);
				form.setValue(teethPath, updatedSelected);
			}
		},
		[disabledTeeth, selectedTeeth, teethPath, form],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent, toothNumber: number) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleToothClick(toothNumber);
			}
		},
		[handleToothClick],
	);

	const handleSelectAllUpperTeeth = useCallback(() => {
		const allUpperTeeth = [...upperLeftTeeth, ...upperRightTeeth];
		const availableUpperTeeth = allUpperTeeth.filter((tooth) => !disabledTeeth.includes(tooth));
		const currentSelected = [...selectedTeeth];

		const allAvailableUpperSelected = availableUpperTeeth.every((tooth) => currentSelected.includes(tooth));

		if (allAvailableUpperSelected) {
			const updatedSelected = currentSelected.filter((tooth: number) => !availableUpperTeeth.includes(tooth));
			setSelectedTeeth(updatedSelected);
			form.setValue(teethPath, updatedSelected);
		} else {
			const newSelected = [...new Set([...currentSelected, ...availableUpperTeeth])];
			setSelectedTeeth(newSelected);
			form.setValue(teethPath, newSelected);
		}
	}, [disabledTeeth, selectedTeeth, teethPath, form]);

	const handleSelectAllLowerTeeth = useCallback(() => {
		const allLowerTeeth = [...lowerLeftTeeth, ...lowerRightTeeth];
		const availableLowerTeeth = allLowerTeeth.filter((tooth) => !disabledTeeth.includes(tooth));
		const currentSelected = [...selectedTeeth];

		const allAvailableLowerSelected = availableLowerTeeth.every((tooth) => currentSelected.includes(tooth));

		if (allAvailableLowerSelected) {
			const updatedSelected = currentSelected.filter((tooth: number) => !availableLowerTeeth.includes(tooth));
			setSelectedTeeth(updatedSelected);
			form.setValue(teethPath, updatedSelected);
		} else {
			const newSelected = [...new Set([...currentSelected, ...availableLowerTeeth])];
			setSelectedTeeth(newSelected);
			form.setValue(teethPath, newSelected);
		}
	}, [disabledTeeth, selectedTeeth, teethPath, form]);

	const renderToothRow = (leftTeeth: number[], rightTeeth: number[]) => {
		return (
			<div className="flex gap-1 justify-center mb-2">
				<div className="flex gap-1">
					{leftTeeth.map((toothNumber) => {
						const isSelected = selectedTeeth.includes(toothNumber);
						const isDisabled = disabledTeeth.includes(toothNumber);
						return (
							<button
								key={toothNumber}
								type="button"
								disabled={isDisabled}
								className={cn(
									"h-8 w-8 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center text-xs font-medium",
									"hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500",
									isDisabled
										? "bg-red-100 border-red-300 text-red-500 cursor-not-allowed opacity-50"
										: isSelected
											? "bg-blue-500 border-blue-500 text-white"
											: "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
								)}
								onClick={() => handleToothClick(toothNumber)}
								onKeyDown={(e) => handleKeyDown(e, toothNumber)}
								aria-label={`Diş ${toothNumber} ${isDisabled ? "kullanılamaz" : isSelected ? "seçili" : "seçilmemiş"}`}
								aria-pressed={isSelected}
								title={isDisabled ? "Bu diş başka bir grupta kullanılıyor" : undefined}
							>
								{toothNumber}
							</button>
						);
					})}
				</div>

				<div className="w-4" />

				<div className="flex gap-1">
					{rightTeeth.map((toothNumber) => {
						const isSelected = selectedTeeth.includes(toothNumber);
						const isDisabled = disabledTeeth.includes(toothNumber);
						return (
							<button
								key={toothNumber}
								type="button"
								disabled={isDisabled}
								className={cn(
									"h-8 w-8 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center text-xs font-medium",
									"hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500",
									isDisabled
										? "bg-red-100 border-red-300 text-red-500 cursor-not-allowed opacity-50"
										: isSelected
											? "bg-blue-500 border-blue-500 text-white"
											: "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
								)}
								onClick={() => handleToothClick(toothNumber)}
								onKeyDown={(e) => handleKeyDown(e, toothNumber)}
								aria-label={`Diş ${toothNumber} ${isDisabled ? "kullanılamaz" : isSelected ? "seçili" : "seçilmemiş"}`}
								aria-pressed={isSelected}
								title={isDisabled ? "Bu diş başka bir grupta kullanılıyor" : undefined}
							>
								{toothNumber}
							</button>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<FormField
				control={form.control}
				name={prosthesisTypePath}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Protez Tipi</FormLabel>
						<FormControl>
							<SelectProsthesisType
								{...field}
								excludeTypes={excludeTypes}
								onChange={(value) => {
									setSelectedProsthesisTypeId(value);
									field.onChange(value);
								}}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{selectedProsthesisTypeId &&
				(isPricingJawBased ? (
					<SelectJaws groupIndex={groupIndex} />
				) : (
					<div>
						<div className="mb-4">
							<button
								type="button"
								onClick={handleSelectAllUpperTeeth}
								className="text-xs text-gray-500 mb-2 w-full text-center hover:text-blue-600 hover:underline cursor-pointer transition-colors focus:outline-none focus:text-blue-600"
								aria-label="Tüm üst çene dişlerini seç/kaldır"
							>
								Üst Çene (Tümünü Seç/Kaldır)
							</button>
							{renderToothRow(upperLeftTeeth, upperRightTeeth)}
						</div>

						<div className="mb-4">
							<button
								type="button"
								onClick={handleSelectAllLowerTeeth}
								className="text-xs text-gray-500 mb-2 w-full text-center hover:text-blue-600 hover:underline cursor-pointer transition-colors focus:outline-none focus:text-blue-600"
								aria-label="Tüm alt çene dişlerini seç/kaldır"
							>
								Alt Çene (Tümünü Seç/Kaldır)
							</button>
							{renderToothRow(lowerLeftTeeth, lowerRightTeeth)}
						</div>

						{selectedTeeth.length > 0 && (
							<p className="text-sm text-gray-600 mt-2">
								Seçili dişler: {selectedTeeth.sort((a, b) => a - b).join(", ")}
							</p>
						)}

						<FormField
							control={form.control}
							name={teethPath}
							render={() => (
								<FormItem>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				))}

			<FormField
				control={form.control}
				name={prosthesisStagePath}
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
		</div>
	);
}
