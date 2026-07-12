export function formatDate(date: Date | string | number | undefined, opts: Intl.DateTimeFormatOptions = {}) {
	if (!date) return "";

	try {
		return new Intl.DateTimeFormat("tr-TR", {
			month: opts.month ?? "long",
			day: opts.day ?? "numeric",
			year: opts.year ?? "numeric",
			timeZone: "Europe/Istanbul",
			...opts,
		}).format(new Date(date));
	} catch (_err) {
		return "";
	}
}

export function formatDateTime(date: Date | string | number | undefined, opts: Intl.DateTimeFormatOptions = {}) {
	if (!date) return "";

	try {
		return new Intl.DateTimeFormat("tr-TR", {
			day: "2-digit",
			month: "2-digit", 
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Europe/Istanbul",
			...opts,
		}).format(new Date(date));
	} catch (_err) {
		return "";
	}
}

export function formatTime(date: Date | string | number | undefined, opts: Intl.DateTimeFormatOptions = {}) {
	if (!date) return "";

	try {
		return new Intl.DateTimeFormat("tr-TR", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Europe/Istanbul",
			...opts,
		}).format(new Date(date));
	} catch (_err) {
		return "";
	}
}

export const DELIVERY_DATE_NOTE_PREFIX = "TESLIM_TARIHI_DEGISTI:";

export function formatDeliveryDateNote(date: Date) {
	return `${DELIVERY_DATE_NOTE_PREFIX}${date.toISOString()}`;
}

export function parseDeliveryDateNote(notes: string | null | undefined): Date | null {
	if (!notes || !notes.startsWith(DELIVERY_DATE_NOTE_PREFIX)) return null;
	const raw = notes.slice(DELIVERY_DATE_NOTE_PREFIX.length);
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function toDatetimeLocalValue(date: Date | string | number) {
	const d = new Date(date);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatCurrency(amount: number, currency = "TRY", locale = "tr-TR") {
	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency,
		}).format(amount);
	} catch (_err) {
		return `${amount} ${currency}`;
	}
}
