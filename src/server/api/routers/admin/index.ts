import { createTRPCRouter } from "@/server/api/trpc";

import { additionalTreatmentRouter } from "./additional-treatment";
import { clinicRouter } from "./clinic";
import { clinicManagerRouter } from "./clinic-manager";
import { dailyCashBoxRouter } from "./daily-cash-box";
import { dentalWorkRouter } from "./dental-work";
import { dentistRouter } from "./dentist";
import { expenseTypeRouter } from "./expense-type";
import { favoriteProsthesisTypeRouter } from "./favorite-prosthesis-type";
import { laboratoryTechnicianRouter } from "./laboratory-technician";
import { patientRouter } from "./patient";
import { patientNoteRouter } from "./patient-note";
import { paymentRouter } from "./payment";
import { prosthesisStageRouter } from "./prosthesis-stage";
import { prosthesisTypeRouter } from "./prosthesis-type";
import { reportRouter } from "./report";
import { technicianStageRouter } from "./technician-stage";
import { toothColorRouter } from "./tooth-color";
import { userRouter } from "./user";

export const adminRouter = createTRPCRouter({
	user: userRouter,
	laboratoryTechnician: laboratoryTechnicianRouter,
	clinic: clinicRouter,
	clinicManager: clinicManagerRouter,
	dailyCashBox: dailyCashBoxRouter,
	dentalWork: dentalWorkRouter,
	dentist: dentistRouter,
	patient: patientRouter,
	payment: paymentRouter,
	prosthesisStage: prosthesisStageRouter,
	prosthesisType: prosthesisTypeRouter,
	additionalTreatment: additionalTreatmentRouter,
	report: reportRouter,
	technicianStage: technicianStageRouter,
	toothColor: toothColorRouter,
	patientNote: patientNoteRouter,
	expenseType: expenseTypeRouter,
	favoriteProsthesisType: favoriteProsthesisTypeRouter,
});
