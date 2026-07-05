import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ScrollTop } from "@/components/scroll-top";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { ProsthesisSheetProvider } from "@/contexts/prosthesis-sheet-context";

export const metadata: Metadata = {
	title: "Özel Karadeniz Ağız ve Diş Sağlığı Polikliniği",
	description: "Özel Karadeniz Ağız ve Diş Sağlığı Polikliniği",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="tr" className={`${geist.variable}`} suppressHydrationWarning>
			<body className="min-h-screen bg-background antialiased">
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
					<NuqsAdapter>
						<TRPCReactProvider>
							<ProsthesisSheetProvider>
								<div className="relative flex min-h-screen flex-col bg-background">
									<div className="relative flex-1">{children}</div>
								</div>
							</ProsthesisSheetProvider>
						</TRPCReactProvider>
					</NuqsAdapter>
					<Toaster position="top-center" closeButton />
					<TailwindIndicator />
					<ScrollTop />
				</ThemeProvider>
			</body>
		</html>
	);
}
