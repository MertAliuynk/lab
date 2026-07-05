import { env } from "@/env";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
	return str
		.split(" ")
		.map((str) => str.charAt(0).toUpperCase() + str.slice(1))
		.join(" ");
}

export function formatCurrency(value: number) {
	return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

export function getRoleName(role: string) {
	if (role === "DENTIST") return "Doktor";
	if (role === "LABORATORY_TECHNICIAN") return "Teknisyen";
	if (role === "ADMIN") return "Yönetici";
	return "Kullanıcı";
}
export function slugify(text: string): string {
	const slug = turkishToEnglish(text)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (slug.length === 0) return crypto.randomUUID();

	return slug;
}

export function turkishToEnglish(text: string): string {
	const charMap: Record<string, string> = {
		ı: "i",
		ğ: "g",
		ü: "u",
		ş: "s",
		ö: "o",
		ç: "c",
		İ: "I",
		Ğ: "G",
		Ü: "U",
		Ş: "S",
		Ö: "O",
		Ç: "C",
	};

	return text.replace(/[ıİğĞüÜşŞöÖçÇ]/g, (char) => charMap[char] ?? char);
}

export function getImageUrl(imagePath: string | null) {
	if (!imagePath) return "";
	return `${env.NEXT_PUBLIC_MINIO_URL}${imagePath}`;
}
