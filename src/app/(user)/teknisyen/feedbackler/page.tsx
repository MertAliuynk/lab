"use client";

import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageSquare, User, Building, Calendar, ChevronLeft, ChevronRight, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function FeedbacklerPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const perPage = 10;

	const { data, isLoading, refetch } = api.laboratoryTechnician.feedback.getAll.useQuery({
		page: currentPage,
		perPage,
	});

	const deleteFeedbackMutation = api.laboratoryTechnician.feedback.delete.useMutation({
		onSuccess: () => {
			toast.success("Feedback silindi");
			refetch();
		},
		onError: (error) => {
			toast.error("Feedback silinirken hata oluştu: " + error.message);
		},
	});

	const handleDelete = (feedbackId: string) => {
		deleteFeedbackMutation.mutate({ feedbackId });
	};

	const formatDate = (date: Date | string) => {
		const now = new Date();
		const feedbackDate = new Date(date);
		const diffInHours = Math.abs(now.getTime() - feedbackDate.getTime()) / (1000 * 60 * 60);
		
		if (diffInHours < 24) {
			// Son 24 saat içinde - saat ve dakika göster
			return feedbackDate.toLocaleString('tr-TR', {
				hour: '2-digit',
				minute: '2-digit',
			}) + ' (Bugün)';
		} else if (diffInHours < 48) {
			// Dün
			return feedbackDate.toLocaleString('tr-TR', {
				hour: '2-digit',
				minute: '2-digit',
			}) + ' (Dün)';
		} else {
			// Eski tarihler - tam tarih
			return feedbackDate.toLocaleDateString('tr-TR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
						<MessageSquare className="w-8 h-8 text-blue-600" />
						Doktor Feedbackleri
					</h1>
					<p className="text-gray-600 mt-2">
						Doktorlardan gelen geri bildirimlerinizi tarih sırasına göre görüntüleyin
					</p>
				</div>
				{data?.feedbacks && data.feedbacks.length > 0 && (
					<Badge variant="secondary" className="bg-blue-100 text-blue-800">
						Toplam: {data.pagination.total} feedback
					</Badge>
				)}
			</div>

			{!data?.feedbacks || data.feedbacks.length === 0 ? (
				<Card className="text-center py-16">
					<CardContent>
						<MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
						<h3 className="text-2xl font-semibold text-gray-700 mb-3">
							Henüz feedback alınmamış
						</h3>
						<p className="text-gray-500 text-lg">
							Doktorlardan gelen geri bildirimler burada görünecek.<br/>
							Tamamlanan işlerinizle ilgili feedback'ler için bekleyin.
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="space-y-4">
						{data.feedbacks.map((feedback: any) => (
							<Card key={feedback.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
								<CardHeader className="pb-4">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
												<User className="h-6 w-6 text-blue-600" />
											</div>
											<div className="flex-1">
												<CardTitle className="text-lg font-semibold text-gray-900 mb-1">
													{feedback.patient.name}
												</CardTitle>
												<div className="flex flex-col gap-1">
													<div className="flex items-center text-sm text-gray-600">
														<User className="w-4 h-4 mr-2 text-green-600" />
														<span className="font-medium">Dr. {feedback.dentist.user.name}</span>
													</div>
													{feedback.dentist.clinic && (
														<div className="flex items-center text-sm text-gray-600">
															<Building className="w-4 h-4 mr-2 text-gray-400" />
															<span>{feedback.dentist.clinic.name}</span>
														</div>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-start flex-col space-y-2">
											<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
												<MessageSquare className="w-3 h-3 mr-1" />
												Feedback
											</Badge>
											<div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
												<Calendar className="w-3 h-3 mr-1" />
												<span className="font-medium">{formatDate(feedback.createdAt)}</span>
											</div>
											{/* Silme özelliği kaldırıldı */}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Puanlamalar */}
										<div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
											<h4 className="text-sm font-medium text-gray-800 mb-3">Değerlendirme Puanları</h4>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">Altyapı</span>
													<div className="flex">
														{Array.from({ length: feedback.infrastructureRating || 0 }, (_, i) => (
															<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
														))}
														{Array.from({ length: 5 - (feedback.infrastructureRating || 0) }, (_, i) => (
															<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
														))}
													</div>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">Hız</span>
													<div className="flex">
														{Array.from({ length: feedback.speedRating || 0 }, (_, i) => (
															<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
														))}
														{Array.from({ length: 5 - (feedback.speedRating || 0) }, (_, i) => (
															<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
														))}
													</div>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">Renk Uyumu</span>
													<div className="flex">
														{Array.from({ length: feedback.colorRating || 0 }, (_, i) => (
															<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
														))}
														{Array.from({ length: 5 - (feedback.colorRating || 0) }, (_, i) => (
															<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
														))}
													</div>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">Tasarım</span>
													<div className="flex">
														{Array.from({ length: feedback.designRating || 0 }, (_, i) => (
															<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
														))}
														{Array.from({ length: 5 - (feedback.designRating || 0) }, (_, i) => (
															<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
														))}
													</div>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">Estetik</span>
													<div className="flex">
														{Array.from({ length: feedback.aestheticsRating || 0 }, (_, i) => (
															<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
														))}
														{Array.from({ length: 5 - (feedback.aestheticsRating || 0) }, (_, i) => (
															<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
														))}
													</div>
												</div>
											</div>
											{/* Ortalama Puan */}
											<div className="mt-3 pt-3 border-t border-yellow-200">
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium text-gray-800">Genel Ortalama</span>
													<div className="flex items-center gap-2">
														<div className="flex">
															{Array.from({ length: Math.round(((feedback.infrastructureRating || 0) + (feedback.speedRating || 0) + (feedback.colorRating || 0) + (feedback.designRating || 0) + (feedback.aestheticsRating || 0)) / 5) }, (_, i) => (
																<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
															))}
														</div>
														<span className="text-sm font-medium text-gray-700">
															{(((feedback.infrastructureRating || 0) + (feedback.speedRating || 0) + (feedback.colorRating || 0) + (feedback.designRating || 0) + (feedback.aestheticsRating || 0)) / 5).toFixed(1)}/5
														</span>
													</div>
												</div>
											</div>
										</div>

										{/* Metin Feedback */}
										<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-l-blue-400">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
													Geri Bildirim Mesajı
												</span>
												<span className="text-xs text-gray-500">
													{formatDate(feedback.createdAt)}
												</span>
											</div>
											<p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
												"{feedback.feedbackText}"
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{data.pagination.totalPages > 1 && (
						<div className="flex items-center justify-between mt-8">
							<div className="text-sm text-gray-600">
								Sayfa {data.pagination.page} / {data.pagination.totalPages} 
								<span className="ml-2">
									({data.pagination.total} toplam feedback)
								</span>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="flex items-center"
								>
									<ChevronLeft className="w-4 h-4 mr-1" />
									Önceki
								</Button>
								
								<div className="flex items-center space-x-1">
									{Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
										.filter(page => 
											page === 1 || 
											page === data.pagination.totalPages || 
											Math.abs(page - currentPage) <= 1
										)
										.map((page, index, array) => (
											<div key={page} className="flex items-center">
												{index > 0 && array[index - 1] !== page - 1 && (
													<span className="text-gray-400 mx-1">...</span>
												)}
												<Button
													variant={page === currentPage ? "default" : "outline"}
													size="sm"
													onClick={() => setCurrentPage(page)}
													className="w-8 h-8 p-0"
												>
													{page}
												</Button>
											</div>
										))
									}
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
									disabled={currentPage === data.pagination.totalPages}
									className="flex items-center"
								>
									Sonraki
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}