import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";

import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/ui/sidebar/nav-user";
import { auth } from "@/server/auth";
import type { User } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function Page({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const user = session.user as User;


	const isDentist = session?.user?.role === "DENTIST";
	const isAdmin = session?.user?.role === "ADMIN";
	const isTechnician = session?.user?.role === "LABORATORY_TECHNICIAN";
	const isClinicManager = session?.user?.role === "CLINIC_MANAGER";

	const adminNavMain = [
		{
			title: "Günlük Kasa",
			url: "/admin/daily-cash-box",
			icon: "Vault",
		},
		{
			title: "SMS Gönder",
			url: "/admin/sms",
			icon: "MessageSquare",
		},
		{
			title: "Raporlar",
			url: "#",
			icon: "ChartBar",
		},
		{
			title: "Ödemeler",
			url: "/admin/payment",
			icon: "Banknote",
		},
		{
			title: "Gider Türleri",
			url: "/admin/expense-type",
			icon: "CreditCard",
		},
	];

	const adminNavClinic = [
		{
			title: "Klinikler",
			url: "/admin/clinic",
			icon: "Hospital",
		},
		{
			title: "Klinik Yöneticileri",
			url: "/admin/clinic-manager",
			icon: "BriefcaseBusiness",
		},
		{
			title: "Hekimler",
			url: "/admin/dentist",
			icon: "BriefcaseMedical",
		},
		{
			title: "Hastalar",
			url: "/admin/patient",
			icon: "Users",
		},
	];

	const adminNavLaboratory = [
		{
			title: "Laboratuvar Çalışanları",
			url: "/admin/laboratory-technician",
			icon: "FlaskRound",
		},
		{
			title: "Protez Türleri",
			url: "/admin/prosthesis-type",
			icon: "Brackets",
		},
		{
			title: "Favori Protez Tipleri",
			url: "/admin/favorite-prosthesis-type",
			icon: "Star",
		},
		{
			title: "Ek Tedaviler",
			url: "/admin/additional-treatment",
			icon: "Heart",
		},
		{
			title: "Protez Aşamaları",
			url: "/admin/prosthesis-stage",
			icon: "FlagTriangleLeft",
		},
		{
			title: "Teknisyen Aşamaları",
			url: "/admin/technician-stage",
			icon: "Layers",
		},
		{
			title: "Diş Renkleri",
			url: "/admin/tooth-color",
			icon: "Palette",
		},
	];

	const dentistNavMain = [
		{
			title: "Hastalarım",
			url: "/hekim/hastalarim",
			icon: "Users",
		},
		{
			title: "İşlemlerim",
			url: "/hekim/gecmis-islemlerim",
			icon: "History",
		},
	];

	const technicianNavMain = [
		{
			title: "Hastalarım",
			url: "/teknisyen/hastalarim",
			icon: "Users",
		},
		{
		title: "İşlem Takvimi",
		url: "/teknisyen/İslemTakvimi",  
		icon: "Calendar",
	},
		{
			title: "Bildirimler",
			url: "/teknisyen/bildirimler",
			icon: "Bell",
		},
		{
			title: "Feedbackler",
			url: "/teknisyen/feedbackler",
			icon: "MessageSquare",
		},
	];

	const clinicManagerNavMain = [
		{
			title: "İşlemlerim",
			url: "/admin/transactions",
			icon: "ClipboardList",
		},
		{
			title: "Güncel Toplam Bakiyem",
			url: "/admin/balance",
			icon: "Wallet",
		},
		{
			title: "Ödeme Geçmişi",
			url: "/admin/payment-history",
			icon: "History",
		},
	];

	const menus = {
		navMain: isDentist
			? dentistNavMain
			: isAdmin
			? adminNavMain
			: isTechnician
			? technicianNavMain
			: isClinicManager
			? clinicManagerNavMain
			: [],
		...(isAdmin && {
			navClinic: adminNavClinic,
			navLaboratory: adminNavLaboratory,
		}),
		navSecondary: [],
	};

	return (
		<SidebarProvider>
			<AppSidebar menus={menus} user={user} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4 justify-between w-full">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<div className="flex items-center gap-2">
							<ModeToggle />
							<NotificationBell user={user} />
							<NavUser
								user={user}
								className="rounded-full size-9 ring-1 ring-border hover:ring-2 hover:ring-muted-foreground transition-all duration-300"
								noText
								side="bottom"
							/>
						</div>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
