import { Button } from "@/components/ui/button";
import { Calendar, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
	searchParams: {
		q?: string;
		status?: "all" | "ongoing" | "completed";
		startDate?: string;
		endDate?: string;
		prosthesisType?: string;
		stage?: string;
		page?: string;
		view?: "grid" | "list";
		sort?: string;
	};
}

export function EmptyState({ searchParams }: EmptyStateProps) {
	const hasFilters = Object.entries(searchParams).some(
		([key, value]) => value && key !== "page" && key !== "view" && key !== "sort",
	);

	if (hasFilters) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="mb-6">
					<Search className="h-8 w-8 text-gray-400" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">Arama kriterlerinize uygun işlem bulunamadı</h3>
				<p className="text-gray-600 max-w-md mx-auto mb-6">
					Filtreleri değiştirerek veya temizleyerek daha geniş sonuçlar elde edebilirsiniz.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Link href="/hekim/gecmis-islemlerim">
						<Button variant="outline">Filtreleri Temizle</Button>
					</Link>
					<Link href="/hekim/hastalarim">
						<Button>Yeni İşlem Ekle</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-8">
				<FileText className="h-12 w-12 text-blue-600" />
			</div>
			<h3 className="text-xl font-semibold text-gray-900 mb-3">Henüz işlem kaydı bulunmuyor</h3>
			<p className="text-gray-600 max-w-lg mx-auto mb-8">
				Dental işlemleriniz burada görüntülenecek. İlk işleminizi oluşturmak için hastalarınız sayfasına gidin ve bir
				hasta seçerek işlem ekleyin.
			</p>
			<div className="flex flex-col sm:flex-row gap-4 justify-center">
				<Link href="/hekim/hastalarim">
					<Button size="lg" className="font-medium">
						<Plus className="h-5 w-5 mr-2" />
						İlk İşlemi Oluştur
					</Button>
				</Link>
				<Link href="/hekim/hastalarim">
					<Button variant="outline" size="lg">
						Hastalarını Gör
					</Button>
				</Link>
			</div>

			<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
				<div className="bg-white rounded-lg border p-6 text-left">
					<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
						<Plus className="h-5 w-5 text-blue-600" />
					</div>
					<h4 className="font-semibold text-gray-900 mb-2">İşlem Oluştur</h4>
					<p className="text-sm text-gray-600">Hastalarınız için protez işlemleri oluşturun ve takip edin.</p>
				</div>

				<div className="bg-white rounded-lg border p-6 text-left">
					<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
						<Search className="h-5 w-5 text-green-600" />
					</div>
					<h4 className="font-semibold text-gray-900 mb-2">İlerlemeyi Takip Et</h4>
					<p className="text-sm text-gray-600">İşlemlerinizin hangi aşamada olduğunu detaylı bir şekilde görün.</p>
				</div>

				<div className="bg-white rounded-lg border p-6 text-left">
					<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
						<Calendar className="h-5 w-5 text-purple-600" />
					</div>
					<h4 className="font-semibold text-gray-900 mb-2">Filtrele ve Ara</h4>
					<p className="text-sm text-gray-600">Geçmiş işlemlerinizi kolayca bulun ve filtreleyerek görüntüleyin.</p>
				</div>
			</div>
		</div>
	);
}
