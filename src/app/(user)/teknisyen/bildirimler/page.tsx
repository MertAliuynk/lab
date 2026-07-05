"use client";

import DashboardHeader from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Bell, BriefcaseMedical, Calendar, CheckCircle2, Clock, Eye, Hospital, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NotificationsPage() {
	const [page, setPage] = useState(1);
	const perPage = 20;

	const {
		data: notificationsData,
		isLoading,
		refetch,
	} = api.notifications.getAllNotifications.useQuery({
		page,
		perPage,
	});

	const { data: unreadCount = 0, refetch: refetchUnreadCount } = api.notifications.getUnreadCount.useQuery();

	const markAsReadMutation = api.notifications.markAsRead.useMutation({
		onSuccess: () => {
			refetch();
			refetchUnreadCount();
		},
	});

	const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
		onSuccess: () => {
			refetch();
			refetchUnreadCount();
		},
	});

	const handleMarkAsRead = (notificationId: string) => {
		markAsReadMutation.mutate({ notificationId });
	};

	const handleMarkAllAsRead = () => {
		markAllAsReadMutation.mutate();
	};

	const notifications = notificationsData?.notifications || [];
	const total = notificationsData?.total || 0;
	const totalPages = Math.ceil(total / perPage);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("tr-TR", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const getStageColor = (stage: string) => {
		const colors = {
			"Sipariş Alındı": "bg-blue-100 text-blue-800 border-blue-200",
			"Ölçü Alındı": "bg-yellow-100 text-yellow-800 border-yellow-200",
			"Model Hazırlandı": "bg-orange-100 text-orange-800 border-orange-200",
			"Prova Yapıldı": "bg-purple-100 text-purple-800 border-purple-200",
			Tamamlandı: "bg-green-100 text-green-800 border-green-200",
			İptal: "bg-red-100 text-red-800 border-red-200",
		};
		return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<DashboardHeader title="Bildirimler" />
				<div className="space-y-4">
					{Array.from({ length: 5 }, (_, i) => (
						<Card key={`notification-loading-${Date.now()}-${i}`} className="animate-pulse">
							<CardHeader className="pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Skeleton className="w-12 h-12 rounded-full" />
										<div className="space-y-2">
											<Skeleton className="h-4 w-64" />
											<Skeleton className="h-3 w-32" />
										</div>
									</div>
									<Skeleton className="h-6 w-20" />
								</div>
							</CardHeader>
							<CardContent>
								<Skeleton className="h-16 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<DashboardHeader title="Bildirimler" />
				<div className="flex items-center gap-3">
					{unreadCount > 0 && (
						<Badge variant="destructive" className="px-3 py-1">
							{unreadCount} Okunmamış
						</Badge>
					)}
					{unreadCount > 0 && (
						<Button
							onClick={handleMarkAllAsRead}
							variant="outline"
							size="sm"
							disabled={markAllAsReadMutation.isPending}
							className="hover:bg-green-50 hover:border-green-300"
						>
							<CheckCircle2 className="w-4 h-4 mr-2" />
							Tümünü Okundu İşaretle
						</Button>
					)}
				</div>
			</div>

			{/* Stats Overview */}
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-lg font-semibold text-gray-700 mb-2">Bildirim Özeti</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto" />
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Bell className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-emerald-700 mb-1">{total}</div>
								<div className="text-sm text-emerald-600 font-medium">Toplam Bildirim</div>
								<div className="w-full h-1 bg-emerald-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<Clock className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-red-700 mb-1">{unreadCount}</div>
								<div className="text-sm text-red-600 font-medium">Okunmamış</div>
								<div className="w-full h-1 bg-red-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full w-full" />
								</div>
							</div>
						</div>

						<div className="hidden md:block w-12 h-12 relative">
							<div className="absolute inset-0 border-t-2 border-r-2 border-gray-300/50 rounded-tr-full" />
							<div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
						</div>

						<div className="group relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 blur-xl" />
							<div className="relative bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
								<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
									<CheckCircle2 className="w-8 h-8 text-white" />
								</div>
								<div className="text-3xl font-bold text-green-700 mb-1">{total - unreadCount}</div>
								<div className="text-sm text-green-600 font-medium">Okunmuş</div>
								<div className="w-full h-1 bg-green-200 rounded-full mt-3">
									<div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full w-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Notifications List */}
			{notifications.length === 0 ? (
				<Card>
					<CardContent className="text-center py-12">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
							<Bell className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Henüz bildirim bulunmuyor</h3>
						<p className="text-muted-foreground">Yeni protez işlemi güncellemeleri geldiğinde burada görünecektir.</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{notifications.map((notification) => (
						<Card
							key={notification.id}
							className={`transition-all duration-200 hover:shadow-lg border-l-4 ${
								notification.read ? "border-l-gray-300 bg-white" : "border-l-emerald-500 bg-emerald-50/30"
							}`}
						>
							<CardHeader className="pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div
											className={`w-12 h-12 rounded-full flex items-center justify-center ${
												notification.read ? "bg-gray-100" : "bg-gradient-to-br from-emerald-500 to-teal-600"
											}`}
										>
											<Settings className={`w-6 h-6 ${notification.read ? "text-gray-500" : "text-white"}`} />
										</div>
										<div className="space-y-1">
											<h4 className="font-semibold text-gray-900">
												{notification.patientName} - {notification.prosthesisType}
											</h4>
											<div className="flex items-center space-x-2">
												<Badge
													className={`text-xs font-medium border ${getStageColor(notification.newStage)}`}
													variant="outline"
												>
													{notification.newStage}
												</Badge>
												{!notification.read && (
													<Badge variant="destructive" className="text-xs">
														Yeni
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										{!notification.read && (
											<Button
												onClick={() => handleMarkAsRead(notification.id)}
												variant="outline"
												size="sm"
												disabled={markAsReadMutation.isPending}
												className="hover:bg-green-50 hover:border-green-300"
											>
												<Eye className="w-4 h-4 mr-1" />
												Okundu
											</Button>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-4 space-y-3">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div className="flex items-center space-x-2">
											<User className="w-4 h-4 text-gray-500" />
											<span className="font-medium">Hasta:</span>
											<Link
												href={`/teknisyen/hastalarim/${notification.patientId}`}
												className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
											>
												{notification.patientName}
											</Link>
										</div>
										<div className="flex items-center space-x-2">
											<BriefcaseMedical className="w-4 h-4 text-gray-500" />
											<span className="font-medium">Hekim:</span>
											<span className="text-gray-700">{notification.dentistName}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Hospital className="w-4 h-4 text-gray-500" />
											<span className="font-medium">Klinik:</span>
											<span className="text-gray-700">{notification.clinicName}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Calendar className="w-4 h-4 text-gray-500" />
											<span className="font-medium">Tarih:</span>
											<span className="text-gray-700">{formatDate(notification.timestamp)}</span>
										</div>
									</div>

									{notification.read && notification.readAt && (
										<div className="pt-2 border-t border-gray-200">
											<div className="flex items-center space-x-2 text-xs text-gray-500">
												<CheckCircle2 className="w-3 h-3" />
												<span>Okunma: {formatDate(notification.readAt)}</span>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center space-x-2 mt-8">
					<Button onClick={() => setPage(page - 1)} disabled={page === 1} variant="outline" size="sm">
						Önceki
					</Button>
					<div className="flex items-center space-x-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
							<Button
								key={pageNum}
								onClick={() => setPage(pageNum)}
								variant={page === pageNum ? "default" : "outline"}
								size="sm"
								className="w-10"
							>
								{pageNum}
							</Button>
						))}
					</div>
					<Button onClick={() => setPage(page + 1)} disabled={page === totalPages} variant="outline" size="sm">
						Sonraki
					</Button>
				</div>
			)}
		</div>
	);
}
