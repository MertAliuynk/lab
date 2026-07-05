import { sendNotificationToTechnician } from "@/lib/notifications";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const notification = await req.json();

		if (!notification.laboratoryTechnicianId) {
			return NextResponse.json({ error: "laboratoryTechnicianId gerekli" }, { status: 400 });
		}

		sendNotificationToTechnician(notification.laboratoryTechnicianId, notification);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Bildirim gönderme hatası:", error);
		return NextResponse.json({ error: "Bildirim gönderilemedi" }, { status: 500 });
	}
}
