import type { DefaultSession, NextAuthConfig } from "next-auth";

import type { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../db";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: UserRole;
			username: string;
			name: string;
		} & DefaultSession["user"];
	}

	interface User {
		username: string;
		password: string;
		role: UserRole;
	}
}

export const authConfig = {
	providers: [
		CredentialsProvider({
			credentials: {
				username: { label: "Kullanıcı Adı", type: "text" },
				password: { label: "Şifre", type: "password" },
			},
			async authorize(credentials) {
				const user = await db.user.findUnique({
					where: { username: credentials.username as string },
				});

				if (!user) return null;

				if (user.password && !(await compare(credentials.password as string, user.password))) return null;

				return user;
			},
		}),
	],
	callbacks: {
		jwt: ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.username = user.username;
				token.name = user.name;
				token.image = user.image;
			}
			return token;
		},
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.id as string,
				role: token.role as UserRole,
				username: token.username as string,
				name: token.name as string,
				image: token.image as string | null,
			},
		}),
	},
	pages: {
		signIn: "/login",
	},
	trustHost: true,
} satisfies NextAuthConfig;
