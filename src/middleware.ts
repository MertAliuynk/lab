import { NextResponse } from "next/server";
import { auth } from "./server/auth";

const authRoutes = ["/login", "/forget-password"];
const publicRoutes = ["/api/auth"];

export default auth(async (req) => {
	const { nextUrl } = req;
	const isAuthenticated = !!req.auth;
	const user = req.auth?.user;
	const pathname = nextUrl.pathname;

	const isAuthRoute = authRoutes.includes(pathname);
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
	const isAdminRoute = pathname.startsWith("/admin");
	const isDentistRoute = pathname.startsWith("/hekim");
	const isTechnicianRoute = pathname.startsWith("/teknisyen");

	if (isAuthRoute && isAuthenticated && user) {
		if (user.role === "ADMIN") {
			return NextResponse.redirect(new URL("/admin/daily-cash-box", nextUrl.origin));
		}
		if (user.role === "DENTIST") {
			return NextResponse.redirect(new URL("/hekim/hastalarim", nextUrl.origin));
		}
		if (user.role === "CLINIC_MANAGER") {
			return NextResponse.redirect(new URL("/admin", nextUrl.origin));
		}
		if (user.role === "LABORATORY_TECHNICIAN") {
			return NextResponse.redirect(new URL("/teknisyen/hastalarim", nextUrl.origin));
		}
	}

	if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
		return NextResponse.redirect(new URL("/login", nextUrl.origin));
	}

	if (isAuthenticated && user) {
		if (isAdminRoute && user.role === "DENTIST") {
			return NextResponse.redirect(new URL("/hekim/hastalarim", nextUrl.origin));
		}

		if (isDentistRoute && user.role !== "DENTIST") {
			if (user.role === "ADMIN" || user.role === "CLINIC_MANAGER") {
				return NextResponse.redirect(new URL("/admin/daily-cash-box", nextUrl.origin));
			}
			if (user.role === "LABORATORY_TECHNICIAN") {
				return NextResponse.redirect(new URL("/teknisyen/hastalarim", nextUrl.origin));
			}
		}

		if (isTechnicianRoute && user.role !== "LABORATORY_TECHNICIAN") {
			if (user.role === "ADMIN" || user.role === "CLINIC_MANAGER") {
				return NextResponse.redirect(new URL("/admin/daily-cash-box", nextUrl.origin));
			}
			if (user.role === "DENTIST") {
				return NextResponse.redirect(new URL("/hekim/hastalarim", nextUrl.origin));
			}
		}

		if (pathname === "/" || pathname === "") {
			if (user.role === "ADMIN" || user.role === "CLINIC_MANAGER") {
				return NextResponse.redirect(new URL("/admin/daily-cash-box", nextUrl.origin));
			}
			if (user.role === "DENTIST") {
				return NextResponse.redirect(new URL("/hekim/hastalarim", nextUrl.origin));
			}
			if (user.role === "LABORATORY_TECHNICIAN") {
				return NextResponse.redirect(new URL("/teknisyen/hastalarim", nextUrl.origin));
			}
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
