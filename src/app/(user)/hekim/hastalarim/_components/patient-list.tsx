"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { PatientCard } from "./patient-card";

type DentalWork = {
	selectedTeeth?: string[];
	selectedJaws?: string[];
	prosthesisType?: {
		name: string;
		pricingType?: string;
	} | null;
	prosthesisStage?: {
		percentage: number;
	} | null;
};

type Patient = {
	id: string;
	name: string;
	createdAt: string | Date;
	dentalWorks?: DentalWork[];
	_count: {
		dentalWorks: number;
	};
} & { isCompleted?: boolean; lastUpdateBy?: 'doctor' | 'technician' | null; hasFeedback?: boolean };

type PatientListProps = {
	patients: Patient[];
	searchQuery: string;
	statusFilter: "all" | "ongoing" | "completed";
	locationFilter: "all" | "at_doctor" | "at_technician";
};

export function PatientList({ patients, searchQuery, statusFilter, locationFilter }: PatientListProps) {
	const filteredPatients = patients.filter((patient) => {
		// Durum filtresi - YENİ MANTIK: 
		// Completed = Hasta bitimi yapılmış VE feedback verilmiş
		// Ongoing = Hasta bitimi yapılmamış VEYA (hasta bitimi yapılmış ama feedback verilmemiş)
		if (statusFilter !== "all") {
			const isFullyCompleted = patient.isCompleted || false;
			const hasFeedback = patient.hasFeedback || false;
			const isReallyCompleted = isFullyCompleted && hasFeedback; // Gerçekten tamamlanmış = bitim yapılmış + feedback verilmiş

			if (statusFilter === "completed" && !isReallyCompleted) {
				return false;
			}
			if (statusFilter === "ongoing" && isReallyCompleted) {
				return false;
			}
		}

		// Lokasyon filtresi
		if (locationFilter !== "all") {
			// Doktorda/teknisyende kontrolü için notes alanını kullan
			const kuryeNotes = ["KURYEE_VERILDI", "KURYE_VERILDI", "TEKRAR_DOKTORA_VERILDI"];
			let isKurye = false;
			
			if (patient.dentalWorks && patient.dentalWorks.length > 0) {
				const worksSorted = [...patient.dentalWorks].sort((a, b) => {
					const aPerc = (a.prosthesisStage?.percentage) || 0;
					const bPerc = (b.prosthesisStage?.percentage) || 0;
					return bPerc - aPerc;
				});
				const lastWork = worksSorted[0];
				if (lastWork && typeof (lastWork as any).notes === 'string' && kuryeNotes.includes((lastWork as any).notes)) {
					isKurye = true;
				}
			}
			
			if (locationFilter === "at_technician" && isKurye) {
				return false; // Kuryeye verilmişse teknisyende değil doktorda
			}
			if (locationFilter === "at_doctor" && !isKurye) {
				return false; // Kuryeye verilmemişse doktorda değil teknisyende
			}
		}

		return true;
	});

	if (filteredPatients.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-12">
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
						<User className="w-8 h-8 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">
						{searchQuery || statusFilter !== "ongoing" || locationFilter !== "all"
							? "Aradığınız kriterlere uygun hasta bulunamadı"
							: "Devam eden hasta bulunmuyor"}
					</h3>
					<p className="text-muted-foreground">
						{searchQuery || statusFilter !== "ongoing" || locationFilter !== "all"
							? "Farklı arama terimleri veya filtreler deneyebilirsiniz."
							: "Şu anda devam eden protez işlemi olan hasta bulunmuyor."}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{filteredPatients.map((patient) => (
				<PatientCard key={patient.id} patient={patient} />
			))}
		</div>
	);
}
