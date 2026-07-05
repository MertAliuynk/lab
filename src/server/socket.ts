import type { Server as HTTPServer } from "node:http";
import type { Socket as NetSocket } from "node:net";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ProsthesisUpdateNotification,
	ServerToClientEvents,
	SocketData,
} from "@/types/socket";
import type { NextApiResponse } from "next";
import { Server, type Socket } from "socket.io";

interface SocketServer extends HTTPServer {
	io?: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}

interface SocketWithIO extends NetSocket {
	server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
	socket: SocketWithIO;
}

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initSocket = (
	res: NextApiResponseWithSocket,
): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> => {
	if (!res.socket.server.io) {
		console.log("Socket.io server kurulumu başlatılıyor...");

		io = new Server(res.socket.server, {
			path: "/api/socket",
			addTrailingSlash: false,
			cors: {
				origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
				methods: ["GET", "POST"],
			},
		});

		io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
			console.log("Yeni socket bağlantısı:", socket.id);

			socket.on("joinRoom", (laboratoryTechnicianId: string) => {
				socket.join(`technician-${laboratoryTechnicianId}`);
				socket.data.laboratoryTechnicianId = laboratoryTechnicianId;
				console.log(`Teknisyen ${laboratoryTechnicianId} odaya katıldı`);
			});

			socket.on("leaveRoom", (laboratoryTechnicianId: string) => {
				socket.leave(`technician-${laboratoryTechnicianId}`);
				console.log(`Teknisyen ${laboratoryTechnicianId} odadan ayrıldı`);
			});

			socket.on("disconnect", () => {
				console.log("Socket bağlantısı kesildi:", socket.id);
			});
		});

		res.socket.server.io = io;
	} else {
		io = res.socket.server.io;
	}

	return io;
};

export const getIO = (): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> => {
	if (!io) {
		throw new Error("Socket.io henüz başlatılmadı!");
	}
	return io;
};

export const sendProsthesisUpdateNotification = (notification: ProsthesisUpdateNotification): void => {
	try {
		const socketServer = getIO();
		socketServer.to(`technician-${notification.laboratoryTechnicianId}`).emit("prosthesisUpdate", notification);
		console.log("Protez güncelleme bildirimi gönderildi:", notification);
	} catch (error) {
		console.error("Protez güncelleme bildirimi gönderilirken hata:", error);
	}
};
