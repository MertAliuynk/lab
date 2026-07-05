import { api } from "@/trpc/server";
import { PasswordForm } from "../../hekim/hesap-ayarlari/_components/password-form";
import { ProfileForm } from "../../hekim/hesap-ayarlari/_components/profile-form";

export default async function AccountSettingsPage() {
	const user = await api.user.me();

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="relative mb-8 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl" />
				<div className="relative p-8">
					<div className="text-center mb-6">
						<h2 className="text-lg font-semibold text-gray-700 mb-2">Hesap Ayarları</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
					</div>
				</div>
			</div>

			<ProfileForm user={user} />
			<PasswordForm />
		</div>
	);
}
