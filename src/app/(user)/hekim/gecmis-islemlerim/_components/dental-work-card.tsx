"use client";

import AttachmentGallery from "@/components/attachment-gallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, MapPin, Palette, Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface DentalWorkCardProps {
	dentalWork: {
		id: string;
		notes?: string | null;
		jawType?: string | null;
		selectedTeeth: string[];
		deliveryDate?: Date | null;
		unitPrice?: number | null;
		totalPrice?: number | null;
		createdAt: Date;
		attachments?: Array<{ url: string; name: string; type: "image" | "video" }> | null;
		patient: {
			id: string;
			name: string;
		};
		prosthesisType: {
			id: string;
			name: string;
		};
		prosthesisStage?: {
			id: string;
			name: string;
			percentage: number;
		} | null;
		toothColor?: {
			id: string;
			name: string;
		} | null;
	};
}

export const DentalWorkCard = ({ dentalWork }: DentalWorkCardProps) => {
	const router = useRouter();

	const handleCardClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest("[data-prevent-navigation]")) {
			return;
		}
		router.push(`/hekim/hasta/${dentalWork.patient.id}`);
	};

	const getJawTypeLabel = (jawType?: string | null) => {
		switch (jawType) {
			case "UPPER":
				return "Üst Çene";
			case "LOWER":
				return "Alt Çene";
			default:
				return "Belirtilmemiş";
		}
	};

	const getStageColor = (percentage: number) => {
		if (percentage === 100) return "bg-green-500";
		if (percentage >= 75) return "bg-blue-500";
		if (percentage >= 50) return "bg-yellow-500";
		if (percentage >= 25) return "bg-orange-500";
		return "bg-red-500";
	};

	return (
		<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold">{dentalWork.prosthesisType.name}</CardTitle>
					{dentalWork.prosthesisStage && (
						<Badge variant="secondary" className={`text-white ${getStageColor(dentalWork.prosthesisStage.percentage)}`}>
							%{dentalWork.prosthesisStage.percentage} - {dentalWork.prosthesisStage.name}
						</Badge>
					)}
				</div>
				<p className="text-sm text-gray-600 flex items-center gap-1">
					<Calendar className="h-4 w-4" />
					{format(dentalWork.createdAt, "dd MMMM yyyy, HH:mm", { locale: tr })}
				</p>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-gray-500" />
							<div>
								<p className="text-sm font-medium">Hasta</p>
								<p className="text-sm text-gray-600">{dentalWork.patient.name}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4 text-gray-500" />
							<div>
								<p className="text-sm font-medium">Çene Konumu</p>
								<p className="text-sm text-gray-600">{getJawTypeLabel(dentalWork.jawType)}</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						{dentalWork.toothColor && (
							<div className="flex items-center gap-2">
								<Palette className="h-4 w-4 text-gray-500" />
								<div>
									<p className="text-sm font-medium">Diş Rengi</p>
									<p className="text-sm text-gray-600">{dentalWork.toothColor.name}</p>
								</div>
							</div>
						)}

						<div className="flex items-center gap-2">
							<Stethoscope className="h-4 w-4 text-gray-500" />
							<div>
								<p className="text-sm font-medium">Seçilen Dişler</p>
								<p className="text-sm text-gray-600">
									{dentalWork.selectedTeeth.length > 0 ? dentalWork.selectedTeeth.join(", ") : "Belirtilmemiş"}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						{dentalWork.deliveryDate && (
							<div>
								<p className="text-sm font-medium">Teslim Tarihi</p>
								<p className="text-sm text-gray-600">
									{format(dentalWork.deliveryDate, "dd MMMM yyyy", { locale: tr })}
								</p>
							</div>
						)}

						{dentalWork.totalPrice && (
							<div>
								<p className="text-sm font-medium">Toplam Fiyat</p>
								<p className="text-lg font-semibold text-green-600">
									₺{Number(dentalWork.totalPrice).toLocaleString("tr-TR")}
								</p>
							</div>
						)}
					</div>
				</div>

				{dentalWork.attachments && dentalWork.attachments.length > 0 && (
					<>
						<Separator className="my-4" />
						<div data-prevent-navigation>
							<AttachmentGallery attachments={dentalWork.attachments} compact={false} />
						</div>
					</>
				)}

				<Separator className="my-4" />
				<div className="flex items-center justify-center">
					<p className="text-xs text-gray-500">İş ID: {dentalWork.id}</p>
				</div>
			</CardContent>
		</Card>
	);
};
