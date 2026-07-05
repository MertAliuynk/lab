import { createTRPCRouter } from "@/server/api/trpc";

import { dentalWorkRouter } from "./dental-work";
import { feedbackRouter } from "./feedback";
import { favoriteProsthesisTypeRouter } from "./favorite-prosthesis-type";
import { patientRouter } from "./patient";
import { patientNoteRouter } from "./patient-note";
import { paymentRouter } from "./payment";

export const dentistRouter = createTRPCRouter({
	dentalWork: dentalWorkRouter,
	feedback: feedbackRouter,
	patient: patientRouter,
	patientNote: patientNoteRouter,
	payment: paymentRouter,
	favoriteProsthesisType: favoriteProsthesisTypeRouter,
});
