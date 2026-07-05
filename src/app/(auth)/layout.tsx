import { Card, CardContent } from "@/components/ui/card";
import { Hospital } from "lucide-react";

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="max-h-screen min-h-screen flex justify-center items-center">
			<Card className="relative">
				<CardContent className="space-y-5 flex flex-col items-center max-w-md min-w-md p-10">
					<div className="flex flex-col items-center gap-1">
						<div className="flex size-12 items-center justify-center rounded-md bg-foreground/10">
							<Hospital className="size-6" />
						</div>
						<p className="font-medium text-lg">Karadeniz Diş Laboratuvarı</p>
					</div>
					{children}
				</CardContent>
			</Card>
		</div>
	);
}
