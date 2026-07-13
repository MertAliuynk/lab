import { db } from "@/server/db";

export async function recomputePatientCompletion(patientId: string) {
	const works = await db.dentalWork.findMany({
		where: { patientId, isDeleted: false },
		select: { isCompleted: true },
	});

	const allCompleted = works.length > 0 && works.every((w) => w.isCompleted);

	return db.patient.update({
		where: { id: patientId },
		data: {
			isCompleted: allCompleted,
			completedAt: allCompleted ? new Date() : null,
		},
	});
}
