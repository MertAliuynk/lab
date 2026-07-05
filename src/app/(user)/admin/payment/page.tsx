import { api } from "@/trpc/server";
import PaymentClient from "./_components/payment-client";

export default async function AdminPaymentPage() {
	const paymentSummary = await api.admin.payment.getClinicPaymentSummary();

	const totalStats = paymentSummary?.reduce(
		(
			acc: { totalDebt: number; totalReceived: number; remainingDebt: number },
			clinic: { totalDebt: number; totalReceived: number; remainingDebt: number },
		) => ({
			totalDebt: acc.totalDebt + clinic.totalDebt,
			totalReceived: acc.totalReceived + clinic.totalReceived,
			remainingDebt: acc.remainingDebt + clinic.remainingDebt,
		}),
		{ totalDebt: 0, totalReceived: 0, remainingDebt: 0 },
	);

	return <PaymentClient paymentSummary={paymentSummary} totalStats={totalStats} />;
}
