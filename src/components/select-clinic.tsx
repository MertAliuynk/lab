import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";

import { Combobox } from "@/components/ui/combobox";

export function SelectClinic({ ...field }: ControllerRenderProps) {
	const { value, onChange } = field;
	const { data: clinics } = api.admin.clinic.getAll.useQuery({ perPage: 0 });

	return (
		<Combobox
			items={
				clinics?.map((clinic) => ({
					id: clinic.id,
					name: clinic.name,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder="Klinik seçiniz"
		/>
	);
}
