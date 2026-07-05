import { api } from "@/trpc/server";
import { use } from "react";
import DentistPaymentClient from "./_components/dentist-payment-client";

interface Props {
	params: Promise<{ hekimId: string }>;
}

export default async function DentistPaymentDetailPage({ params }: Props) {
	const { hekimId } = use(params);

	const paymentDetail = await api.admin.payment.getDentistPaymentDetail({
		dentistId: hekimId,
	});

	return <DentistPaymentClient paymentDetail={paymentDetail} />;
}
