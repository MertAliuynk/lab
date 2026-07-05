"use client";

import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";
import { Combobox } from "./ui/combobox";

export default function SelectProsthesisStage({ ...field }: ControllerRenderProps) {
	const { value, onChange } = field;
	const { data: prosthesisStages } = api.admin.prosthesisStage.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	return (
		<Combobox
			items={
				prosthesisStages?.map((prosthesisStage) => ({
					id: prosthesisStage.id,
					name: prosthesisStage.name,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder="Protez aşaması seçiniz"
		/>
	);
}
