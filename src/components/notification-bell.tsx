"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type NotificationData, useNotifications } from "@/hooks/use-notifications";
import { api } from "@/trpc/react";
import type { User } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, BellRing, X } from "lucide-react";

interface NotificationBellProps {
	user: User;
}

type CombinedNotification = {
	id: string;
	patientName: string;
	patientId: string;
	prosthesisType: string;
	newStage: string;
	dentistName: string;
	clinicName: string;
	dentalWorkId: string | null;
	timestamp: Date;
	type: "prosthesisUpdate" | "connected" | "newPatient";
	read?: boolean;
	source?: "live" | "db";
	notificationReadId?: string;
	message?: string;
};

export const NotificationBell = ({ user }: NotificationBellProps) => {
	const {
		notifications: liveNotifications,
		unreadCount: liveUnreadCount,
		markAsRead: markLiveAsRead,
		clearNotifications,
	} = useNotifications(user.id);

	const utils = api.useUtils();

	// Veritabanındaki bildirimleri al
	const { data: dbNotifications = [] } = api.notifications.getUnreadNotifications.useQuery(undefined, {
		enabled: user.role === "LABORATORY_TECHNICIAN",
		refetchOnWindowFocus: true,
	});

	// Toplam okunmamış sayısı
	const { data: dbUnreadCount = 0 } = api.notifications.getUnreadCount.useQuery(undefined, {
		enabled: user.role === "LABORATORY_TECHNICIAN",
		refetchOnWindowFocus: true,
	});

	// Bildirim okuma mutation'ı
	const markAsReadMutation = api.notifications.markAsRead.useMutation({
		onSuccess: () => {
			// Veritabanı verilerini yenile
			utils.notifications.getUnreadNotifications.invalidate();
			utils.notifications.getUnreadCount.invalidate();
		},
	});

	// Tüm bildirimleri okundu olarak işaretle
	const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
		onSuccess: () => {
			// Veritabanı verilerini yenile
			utils.notifications.getUnreadNotifications.invalidate();
			utils.notifications.getUnreadCount.invalidate();
			// Canlı bildirimleri de temizle
			clearNotifications();
		},
	});

	// Canlı ve veritabanı bildirimlerini birleştir
	const allNotifications: CombinedNotification[] = [
		...liveNotifications.filter((n) => n.type === "prosthesisUpdate" || n.type === "newPatient").map((n) => ({ 
			...n, 
			source: "live" as const,
			dentalWorkId: n.dentalWorkId || null
		} as CombinedNotification)),
		...dbNotifications.map((n) => ({ 
			...n, 
			source: "db" as const,
			dentalWorkId: n.dentalWorkId || null
		} as CombinedNotification)),
	].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	// Toplam okunmamış sayısı
	const totalUnreadCount = liveUnreadCount + dbUnreadCount;

	const handleNotificationClick = (notification: CombinedNotification) => {
		if (notification.source === "live") {
			markLiveAsRead(notification.id);
		} else if (notification.source === "db") {
			markAsReadMutation.mutate({ notificationId: notification.id });
		}

		if ((notification.type === "prosthesisUpdate" || notification.type === "newPatient") && notification.patientId) {
			window.location.href = `/teknisyen/hastalarim/${notification.patientId}`;
		}
	};

	const handleClearAll = () => {
		// Canlı bildirimleri temizle
		clearNotifications();
		// Veritabanındaki tüm bildirimleri okundu olarak işaretle
		markAllAsReadMutation.mutate();
	};

	if (user.role !== "LABORATORY_TECHNICIAN") {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					{totalUnreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
					{totalUnreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{totalUnreadCount > 9 ? "9+" : totalUnreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between p-2">
					<DropdownMenuLabel className="p-0">Bildirimler</DropdownMenuLabel>
					{allNotifications.length > 0 && (
						<Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto p-1 text-xs">
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />

				{allNotifications.length === 0 ? (
					<div className="p-4 text-center text-sm text-muted-foreground">Henüz bildirim yok</div>
				) : (
					
					<div className="max-h-80 overflow-y-auto">
						{allNotifications.slice(0, 10).map((notification) => (
							<DropdownMenuItem
								key={`${notification.source}-${notification.id}`}
								className="flex flex-col items-start gap-1 p-3 cursor-pointer"
								onClick={() => handleNotificationClick(notification)}
							>
								<div className="flex items-start justify-between w-full">
									<div className="flex-1">
										<div className="font-medium text-sm">
											{notification.type === "newPatient" 
												? "Yeni Hasta/Protez Oluşturuldu" 
												: "Yeni Protez Güncellemesi"
											}
										</div>
										<div className="text-xs text-muted-foreground">
											{notification.patientName} - {notification.prosthesisType}
										</div>
										{notification.dentistName && (
											<div className="text-xs text-muted-foreground">
												Dt. {notification.dentistName}
											</div>
										)}
										<div className="text-xs text-muted-foreground">Aşama: "{notification.newStage}"</div>
									</div>
									{!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
								</div>
								<div className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(notification.timestamp), {
										addSuffix: true,
										locale: tr,
									})}
								</div>
							</DropdownMenuItem>
						))}
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
