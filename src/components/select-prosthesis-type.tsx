"use client";

import { api } from "@/trpc/react";
import type { ControllerRenderProps } from "react-hook-form";
import { Combobox } from "./ui/combobox";

interface SelectProsthesisTypeProps extends ControllerRenderProps {
	excludeTypes?: string[];
}

export default function SelectProsthesisType({ excludeTypes = [], ...field }: SelectProsthesisTypeProps) {
	const { value, onChange } = field;
	const { data: prosthesisTypes } = api.admin.prosthesisType.getAll.useQuery({
		page: 1,
		perPage: 100,
	});

	// Hem doktor hem teknisyen için favori protez tiplerini çek
	const { data: dentistFavorites = [] } = api.dentist?.favoriteProsthesisType?.getAll?.useQuery?.() || { data: [] };
	// Teknisyen için endpoint yok, boş dizi ata:
	const technicianFavorites: any[] = [];

	// Hangi sayfada kullanıldığına göre favori datasını seç
	const favoriteProsthesisTypes = dentistFavorites.length > 0 ? dentistFavorites : technicianFavorites;

	const filteredTypes = prosthesisTypes?.filter((type) => !excludeTypes.includes(type.id)) || [];

	// Favorileri ve normal tipleri ayır
	const favoriteIds = new Set(favoriteProsthesisTypes.map(fav => fav.prosthesisType.id));
	const favorites = filteredTypes.filter(type => favoriteIds.has(type.id));
	const nonFavorites = filteredTypes.filter(type => !favoriteIds.has(type.id));

	// Favorileri sıraya göre sırala
	const sortedFavorites = favorites.sort((a, b) => {
		const aOrder = favoriteProsthesisTypes.find(fav => fav.prosthesisType.id === a.id)?.order || 0;
		const bOrder = favoriteProsthesisTypes.find(fav => fav.prosthesisType.id === b.id)?.order || 0;
		return aOrder - bOrder;
	});

	// Combobox için items oluştur
	const comboboxItems = [
		// Favoriler - yıldızlı
		...sortedFavorites.map((prosthesisType) => ({
			id: prosthesisType.id,
			name: `⭐ ${prosthesisType.name}`,
		})),
		// Normal tipler  
		...nonFavorites.map((prosthesisType) => ({
			id: prosthesisType.id,
			name: prosthesisType.name,
		})),
	];

	return (
		<Combobox
			items={comboboxItems}
			value={value}
			onChange={onChange}
			placeholder="Protez tipi seçiniz"
		/>
	);
}
