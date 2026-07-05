import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";

import { Combobox } from "@/components/ui/combobox";

export function SelectDentist({ ...field }: ControllerRenderProps) {
	const { value, onChange } = field;
	const { data: dentists } = api.admin.dentist.getAll.useQuery({ perPage: 0 });

	return (
		<Combobox
			items={
				dentists?.map((dentist) => ({
					id: dentist.id,
					name: dentist.user.name,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder="Diş hekimi seçiniz"
		/>
	);
}
