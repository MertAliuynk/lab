import { addClient, removeClient } from "@/lib/notifications";
import { auth } from "@/server/auth";
import type { ProsthesisUpdateNotification, NewPatientNotification } from "@/types/socket";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ technicianId: string }> }) {
	const params = await props.params;
	const session = await auth();

	if (!session?.user?.id) {
		return new Response("Unauthorized", { status: 401 });
	}

	const technicianId = params.technicianId;

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const send = (data: ProsthesisUpdateNotification | NewPatientNotification | { type: string; message: string }) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			const writer = {
				write: send,
				close: () => {
					removeClient(technicianId);
					controller.close();
				},
			} as WritableStreamDefaultWriter;

			addClient(technicianId, writer);

			send({ type: "connected", message: "Bildirim sistemi bağlandı" });

			req.signal.addEventListener("abort", () => {
				removeClient(technicianId);
				controller.close();
			});
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Cache-Control",
		},
	});
}
