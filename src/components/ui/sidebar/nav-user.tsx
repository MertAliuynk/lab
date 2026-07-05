"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";
import { useState } from "react";

import LogoutDialog from "@/components/logout-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { User } from "@prisma/client";
import Link from "next/link";

export function NavUser({
	user,
	className,
	noText,
	side,
	align,
}: {
	user: User;
	className?: string;
	noText?: boolean;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
}) {
	const { isMobile } = useSidebar();
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						{!noText ? (
							<SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
								<Avatar className={cn("size-8 rounded-lg", className)}>
									<AvatarImage src={user.image ?? ""} alt={user.name} />
									<AvatarFallback className="rounded-lg">SD</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">@{user.username}</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						) : (
							<Avatar className={cn("size-8 rounded-lg cursor-pointer", className)}>
								<AvatarImage src={user.image ?? ""} alt={user.name} />
								<AvatarFallback className="rounded-lg">SD</AvatarFallback>
							</Avatar>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={(side ?? isMobile) ? "bottom" : "right"}
						align={align ?? "end"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image ?? ""} alt={user.name} />
									<AvatarFallback className="rounded-lg">SD</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">@{user.username}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<Link href="hesap-ayarlari">
								<DropdownMenuItem>
									<BadgeCheck />
									Hesap Ayarları
								</DropdownMenuItem>
							</Link>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
							<LogOut />
							Çıkış Yap
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
