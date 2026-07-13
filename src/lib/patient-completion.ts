export type PatientCompletionState = "completed" | "partial" | "ongoing";

export function getCompletionState(dentalWorks: { isCompleted?: boolean | null }[] | undefined): PatientCompletionState {
	if (!dentalWorks || dentalWorks.length === 0) return "ongoing";

	const completedCount = dentalWorks.filter((w) => w.isCompleted).length;

	if (completedCount === dentalWorks.length) return "completed";
	if (completedCount > 0) return "partial";
	return "ongoing";
}
