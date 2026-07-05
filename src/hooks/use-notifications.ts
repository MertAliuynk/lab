import type { ProsthesisUpdateNotification, NewPatientNotification } from "@/types/socket";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type NotificationData = (ProsthesisUpdateNotification | NewPatientNotification) & {
	type: "prosthesisUpdate" | "connected" | "newPatient";
	message?: string;
	read?: boolean;
};

export const useNotifications = (laboratoryTechnicianId?: string) => {
	const [isConnected, setIsConnected] = useState(false);
	const [notifications, setNotifications] = useState<NotificationData[]>([]);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (!laboratoryTechnicianId) return;

		const eventSource = new EventSource(`/api/notifications/${laboratoryTechnicianId}`);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			console.log("Bildirim bağlantısı kuruldu");
			setIsConnected(true);
		};

		eventSource.onmessage = (event) => {
			try {
				const data: NotificationData = JSON.parse(event.data);

				if (data.type === "connected") {
					console.log("Bildirim sistemi aktif:", data.message);
					return;
				}

				if (data.type === "prosthesisUpdate") {
					console.log("Yeni protez güncellemesi:", data);

					setNotifications((prev) => [{ ...data, read: false }, ...prev.slice(0, 49)]);

					toast.success("Yeni Protez Güncellemesi!", {
						description: `${data.patientName} - ${data.prosthesisType} aşaması "${data.newStage}" olarak güncellendi`,
						duration: 5000,
						action: {
							label: "Görüntüle",
							onClick: () => {
								window.location.href = `/teknisyen/hastalarim/${data.patientId}`;
							},
						},
					});
				}

				if (data.type === "newPatient") {
					console.log("Yeni hasta/protez oluşturuldu:", data);

					setNotifications((prev) => [{ ...data, read: false }, ...prev.slice(0, 49)]);

					toast.info("Yeni Hasta/Protez Oluşturuldu!", {
						description: `${data.patientName} için ${data.prosthesisType} protezi oluşturuldu`,
						duration: 5000,
						action: {
							label: "Görüntüle",
							onClick: () => {
								window.location.href = `/teknisyen/hastalarim/${data.patientId}`;
							},
						},
					});
				}
			} catch (error) {
				console.error("Bildirim parse hatası:", error);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE bağlantı hatası:", error);
			setIsConnected(false);
		};

		return () => {
			eventSource.close();
			eventSourceRef.current = null;
			setIsConnected(false);
		};
	}, [laboratoryTechnicianId]);

	const clearNotifications = () => {
		setNotifications([]);
	};

	const markAsRead = (notificationId: string) => {
		setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)));
	};

	return {
		isConnected,
		notifications,
		clearNotifications,
		markAsRead,
		unreadCount: notifications.filter((n) => !n.read).length,
	};
};
