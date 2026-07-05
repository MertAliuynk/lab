import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useCallback, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface SelectJawsProps {
	groupIndex: number | string;
}

export default function SelectJaws({ groupIndex }: SelectJawsProps) {
	const form = useFormContext();
	const basePath = typeof groupIndex === "string" ? groupIndex : `prosthesisGroups.${groupIndex}`;
	const jawsPath = `${basePath}.selectedJaws`;

	const [selectedJaws, setSelectedJaws] = useState<string[]>([]);

	const handleJawToggle = useCallback(
		(jaw: string) => {
			setSelectedJaws((currentSelected) => {
				const isSelected = currentSelected.includes(jaw);
				let updatedSelected: string[];

				if (isSelected) {
					updatedSelected = currentSelected.filter((j) => j !== jaw);
				} else {
					updatedSelected = [...currentSelected, jaw];
				}

				return updatedSelected;
			});
		},
		[],
	);

	// Form değerini useEffect ile güncelle
	useEffect(() => {
		form.setValue(jawsPath, selectedJaws, { shouldValidate: false });
	}, [selectedJaws, form, jawsPath]);

	const isJawSelected = useCallback((jaw: string) => selectedJaws.includes(jaw), [selectedJaws]);

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<div className="flex items-center space-x-2">
					<Checkbox
						id={`upper-jaw-${groupIndex}`}
						checked={isJawSelected("UPPER")}
						onCheckedChange={() => handleJawToggle("UPPER")}
					/>
					<Label htmlFor={`upper-jaw-${groupIndex}`} className="cursor-pointer">
						Üst Çene
					</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id={`lower-jaw-${groupIndex}`}
						checked={isJawSelected("LOWER")}
						onCheckedChange={() => handleJawToggle("LOWER")}
					/>
					<Label htmlFor={`lower-jaw-${groupIndex}`} className="cursor-pointer">
						Alt Çene
					</Label>
				</div>
			</div>

			{selectedJaws.length > 0 && (
				<p className="text-sm text-muted-foreground">
					Seçili çeneler: {selectedJaws.map((jaw) => (jaw === "UPPER" ? "Üst Çene" : "Alt Çene")).join(", ")}
				</p>
			)}

			<FormField
				control={form.control}
				name={jawsPath}
				render={() => (
					<FormItem>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
