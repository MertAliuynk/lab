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
