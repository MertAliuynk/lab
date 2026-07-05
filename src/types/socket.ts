export interface ProsthesisUpdateNotification {
	id: string;
	patientName: string;
	patientId: string;
	prosthesisType: string;
	newStage: string;
	dentistName: string;
	clinicName: string;
	laboratoryTechnicianId: string;
	dentalWorkId: string;
	timestamp: Date;
}

export interface NewPatientNotification {
	id: string;
	patientName: string;
	patientId: string;
	prosthesisType: string;
	newStage: string;
	dentistName: string;
	clinicName: string;
	laboratoryTechnicianId: string;
	dentalWorkId: string;
	timestamp: Date;
	type: "newPatient";
}

export interface ServerToClientEvents {
	prosthesisUpdate: (notification: ProsthesisUpdateNotification) => void;
	newPatient: (notification: NewPatientNotification) => void;
}

export interface ClientToServerEvents {
	joinRoom: (laboratoryTechnicianId: string) => void;
	leaveRoom: (laboratoryTechnicianId: string) => void;
}

export type InterServerEvents = Record<string, never>;

export interface SocketData {
	laboratoryTechnicianId?: string;
}
