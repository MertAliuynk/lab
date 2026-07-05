import type { ProsthesisUpdateNotification, NewPatientNotification } from "@/types/socket";

const clients = new Map<string, WritableStreamDefaultWriter>();

export const addClient = (technicianId: string, writer: WritableStreamDefaultWriter) => {
	clients.set(technicianId, writer);
};

export const removeClient = (technicianId: string) => {
	clients.delete(technicianId);
};

export const sendNotificationToTechnician = (technicianId: string, notification: ProsthesisUpdateNotification) => {
	const client = clients.get(technicianId);
	if (client) {
		client.write(notification);
	}
};

export const sendNewPatientNotificationToTechnician = (technicianId: string, notification: NewPatientNotification) => {
	console.log(`[NOTIFICATION] Teknisyen ${technicianId} için yeni hasta bildirimi gönderiliyor:`, notification);
	const client = clients.get(technicianId);
	if (client) {
		console.log(`[NOTIFICATION] Client bulundu, bildirim gönderiliyor...`);
		client.write(notification);
	} else {
		console.log(`[NOTIFICATION] Client bulunamadı! Aktif teknisyen sayısı: ${clients.size}`);
		console.log(`[NOTIFICATION] Aktif teknisyenler:`, Array.from(clients.keys()));
	}
};
