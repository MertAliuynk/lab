"use client";

import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";
import { Combobox } from "./ui/combobox";

interface SelectPatientProps extends ControllerRenderProps {
	userType?: "dentist" | "technician";
}

export default function SelectPatient({ userType = "technician", ...field }: SelectPatientProps) {
	const { value, onChange } = field;
	
	// Kullanıcı tipine göre farklı API çağır
	const { data: patients } = userType === "dentist" 
		? api.dentist.patient.getMy.useQuery({ page: 1, perPage: 100 })
		: api.laboratoryTechnician.patient.getAll.useQuery({ page: 1, perPage: 100 });

	return (
		<Combobox
			items={
				patients?.map((patient) => ({
					id: patient.id,
					name: patient.name,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder="Hasta seçiniz"
		/>
	);
}
