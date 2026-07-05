"use client";
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";
import { useProsthesisSheet } from "@/contexts/prosthesis-sheet-context";


import { NavMain } from "@/components/ui/sidebar/nav-main";
import { NavUser } from "@/components/ui/sidebar/nav-user";
import type { User } from "@prisma/client";

import AddProsthesisSheet from "@/components/add-prosthesis-sheet";
import Logo from "@/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavSecondary } from "./nav-secondary";

type PageProps = React.ComponentProps<typeof Sidebar> & {
	user: User;
	menus: {
		[key: string]: { title: string; url: string; icon: string }[];
	};
};

export function AppSidebar({ user, menus, ...props }: PageProps) {
		const isDentist = user.role === "DENTIST";
		const { openSheet } = useProsthesisSheet();

	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="#">
								<Logo role={user.role} />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				   {isDentist && (
					   <>
						   <Button
							   size="sm"
							   variant="blue"
							   className="mb-4 w-full"
							   onClick={() => openSheet()}
						   >
							   <ClipboardPlus /> Protez Ekle
						   </Button>
						   <AddProsthesisSheet />
					   </>
				   )}
				{menus.navMain && <NavMain items={menus.navMain} label="Sayfalar" />}
				{menus.navLaboratory && <NavMain items={menus.navLaboratory} label="Laboratuvar" />}
				{menus.navClinic && <NavMain items={menus.navClinic} label="Klinik" />}
				{menus.navSecondary && <NavSecondary items={menus.navSecondary} className="mt-auto" />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
