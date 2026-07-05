"use client";

import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";
import { Combobox } from "./ui/combobox";

export default function SelectProsthesisColor({ ...field }: ControllerRenderProps) {
	const { value, onChange } = field;
	const { data: toothColors } = api.admin.toothColor.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	return (
		<Combobox
			items={
				toothColors?.map((toothColor) => ({
					id: toothColor.id,
					name: toothColor.name,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder="Diş rengi seçiniz"
		/>
	);
}
