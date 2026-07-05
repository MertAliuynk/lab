"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ProsthesisSheetContextType {
	isOpen: boolean;
	patientId?: string;
	dentistId?: string;
	openSheet: (patientId?: string, dentistId?: string) => void;
	closeSheet: () => void;
}

const ProsthesisSheetContext = createContext<ProsthesisSheetContextType | undefined>(undefined);

export function ProsthesisSheetProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [patientId, setPatientId] = useState<string | undefined>();
	const [dentistId, setDentistId] = useState<string | undefined>();

	const openSheet = (patientId?: string, dentistId?: string) => {
		setPatientId(patientId);
		setDentistId(dentistId);
		setIsOpen(true);
	};

	const closeSheet = () => {
		setIsOpen(false);
		setPatientId(undefined);
		setDentistId(undefined);
	};

	return (
		<ProsthesisSheetContext.Provider
			value={{
				isOpen,
				patientId,
				dentistId,
				openSheet,
				closeSheet,
			}}
		>
			{children}
		</ProsthesisSheetContext.Provider>
	);
}

export function useProsthesisSheet() {
	const context = useContext(ProsthesisSheetContext);
	if (context === undefined) {
		throw new Error("useProsthesisSheet must be used within a ProsthesisSheetProvider");
	}
	return context;
}
