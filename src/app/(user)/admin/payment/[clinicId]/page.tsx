import { api } from "@/trpc/server";
import ClinicPaymentClient from "./_components/clinic-payment-client";
import type { PaymentDetail } from "./_components/clinic-payment-client";

function deepSerialize(obj: unknown): unknown {
	if (Array.isArray(obj)) {
		return obj.map(deepSerialize);
	}
	if (obj && typeof obj === "object") {
		if (typeof (obj as { toJSON?: () => unknown }).toJSON === "function") {
			return (obj as { toJSON: () => unknown }).toJSON();
		}
		const newObj: Record<string, unknown> = {};
		for (const key in obj as Record<string, unknown>) {
			newObj[key] = deepSerialize((obj as Record<string, unknown>)[key]);
		}
		return newObj;
	}
	return obj;
}

export default async function ClinicPaymentDetailPage({ params }: { params: Promise<{ clinicId: string }> }) {
	const { clinicId } = await params;
	const paymentDetailRaw = await api.admin.payment.getClinicPaymentDetail({ clinicId });
	const paymentDetail = deepSerialize(paymentDetailRaw) as PaymentDetail;

	return <ClinicPaymentClient paymentDetail={paymentDetail} clinicId={clinicId} />;
}
