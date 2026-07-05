import Spinner from "@/components/spinner";

export default function loading() {
	return (
		<div className="flex justify-center items-center h-screen">
			<Spinner />
		</div>
	);
}
