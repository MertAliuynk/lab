import Spinner from "@/components/spinner";

export default function loading() {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<Spinner label="Yükleniyor..." />
		</div>
	);
}
