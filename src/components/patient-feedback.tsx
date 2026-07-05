"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { MessageSquare, Send, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PatientFeedbackProps = {
	patientId: string;
	patientName: string;
	isCompleted: boolean;
	onSuccess?: () => void;
};

export default function PatientFeedback({ 
	patientId, 
	patientName, 
	isCompleted, 
	onSuccess 
}: PatientFeedbackProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [infrastructureRating, setInfrastructureRating] = useState(0);
	const [speedRating, setSpeedRating] = useState(0);
	const [colorRating, setColorRating] = useState(0);
	const [designRating, setDesignRating] = useState(0);
	const [aestheticsRating, setAestheticsRating] = useState(0);
	
	const utils = api.useUtils();

	// Mevcut feedback'leri getir
	const { data: existingFeedbacks = [], isLoading } = api.dentist.feedback.getByPatient.useQuery(
		{ patientId },
		{ enabled: isCompleted }
	);

	// Feedback oluşturma mutation
	const createFeedbackMutation = api.dentist.feedback.create.useMutation({
		onSuccess: async () => {
			toast.success("Geri bildirim başarıyla gönderildi!");
			setFeedbackText("");
			setInfrastructureRating(0);
			setSpeedRating(0);
			setColorRating(0);
			setDesignRating(0);
			setAestheticsRating(0);
			setIsOpen(false);
			
			// Cache'leri invalidate et
			await utils.dentist.feedback.getByPatient.invalidate();
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Geri bildirim gönderilirken hata oluştu!");
		},
	});

	const handleSubmit = () => {


		if (infrastructureRating === 0 || speedRating === 0 || colorRating === 0 || designRating === 0 || aestheticsRating === 0) {
			toast.error("Lütfen tüm kategorileri puanlayın!");
			return;
		}

		createFeedbackMutation.mutate({
			patientId,
			feedbackText: feedbackText.trim(),
			infrastructureRating,
			speedRating,
			colorRating,
			designRating,
			aestheticsRating,
		});
	};

	// Yıldız rating bileşeni
	const StarRating = ({ 
		rating, 
		onRatingChange, 
		label 
	}: { 
		rating: number; 
		onRatingChange: (rating: number) => void; 
		label: string;
	}) => (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{label}</Label>
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => onRatingChange(star)}
						className={`p-1 rounded transition-colors ${
							star <= rating
								? "text-yellow-500 hover:text-yellow-600"
								: "text-gray-300 hover:text-gray-400"
						}`}
					>
						<Star className="w-6 h-6 fill-current" />
					</button>
				))}
			</div>
		</div>
	);

	// Eğer hasta tamamlanmamışsa, component'i gösterme
	if (!isCompleted) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				   <Button 
					   size="sm"
					   variant="outline"
					   className="text-xs px-3 py-1 h-7 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
					   data-prevent-navigation
					   onClick={e => e.stopPropagation()}
					   onMouseDown={e => e.stopPropagation()}
				   >
					<MessageSquare className="w-3 h-3 mr-1" />
					Bu İşi Değerlendir
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageSquare className="w-5 h-5 text-blue-600" />
						{patientName} İçin Feedback
					</DialogTitle>
					<DialogDescription>
						Laboratuvar çalışmasını değerlendirin. Bu bildirim teknisyen panelinde görünecektir.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Mevcut Feedback'ler */}
					{isLoading ? (
						<div className="animate-pulse space-y-2">
							<div className="h-4 bg-gray-300 rounded w-3/4" />
							<div className="h-4 bg-gray-300 rounded w-1/2" />
						</div>
					) : existingFeedbacks.length > 0 ? (
						<div className="space-y-2">
							<Label className="text-sm font-medium text-gray-700">
								Gönderilmiş Geri Bildirimler:
							</Label>
							<div className="max-h-32 overflow-y-auto space-y-2">
								{existingFeedbacks.map((feedback: any) => (
									<div key={feedback.id} className="p-3 bg-gray-50 rounded-lg border">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="text-sm text-gray-900 mb-2">
													{feedback.feedbackText}
												</p>
												
												{/* Puanlamalar */}
												<div className="grid grid-cols-2 gap-2 text-xs">
													<div className="flex items-center gap-1">
														<span className="text-gray-600">Altyapı:</span>
														<div className="flex">
															{Array.from({ length: feedback.infrastructureRating || 0 }, (_, i) => (
																<Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
															))}
														</div>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-gray-600">Hız:</span>
														<div className="flex">
															{Array.from({ length: feedback.speedRating || 0 }, (_, i) => (
																<Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
															))}
														</div>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-gray-600">Renk:</span>
														<div className="flex">
															{Array.from({ length: feedback.colorRating || 0 }, (_, i) => (
																<Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
															))}
														</div>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-gray-600">Tasarım:</span>
														<div className="flex">
															{Array.from({ length: feedback.designRating || 0 }, (_, i) => (
																<Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
															))}
														</div>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-gray-600">Estetik:</span>
														<div className="flex">
															{Array.from({ length: feedback.aestheticsRating || 0 }, (_, i) => (
																<Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
															))}
														</div>
													</div>
												</div>
												
												<div className="flex items-center gap-2 mt-2">
													<span className="text-xs text-gray-500">
														{new Date(feedback.createdAt).toLocaleDateString("tr-TR", {
															day: "numeric",
															month: "short",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
													{feedback.laboratoryTechnician && (
														<Badge variant="outline" className="text-xs">
															→ {feedback.laboratoryTechnician.user.name}
														</Badge>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					) : null}

					{/* Yeni Feedback Formu */}
					<div className="space-y-4 border-t pt-4">
						<h4 className="font-medium text-gray-900">Yeni Değerlendirme</h4>
						
						{/* Puanlama Kategorileri */}
						<div className="grid grid-cols-1 gap-4">
							<StarRating
								rating={infrastructureRating}
								onRatingChange={setInfrastructureRating}
								label="Altyapıyı nasıl buldunuz?"
							/>
							<StarRating
								rating={speedRating}
								onRatingChange={setSpeedRating}
								label="İşlerin bitiş hızını nasıl buldunuz?"
							/>
							<StarRating
								rating={colorRating}
								onRatingChange={setColorRating}
								label="Renk uyumunu nasıl buldunuz?"
							/>
							<StarRating
								rating={designRating}
								onRatingChange={setDesignRating}
								label="Dişlerin tasarımını nasıl buldunuz?"
							/>
							<StarRating
								rating={aestheticsRating}
								onRatingChange={setAestheticsRating}
								label="İşin estetiğini nasıl buldunuz?"
							/>
						</div>

						{/* Metin Feedback */}
						<div className="space-y-2">
							<Label htmlFor="feedback" className="text-sm font-medium">
								Genel Yorumunuz
							</Label>
							<textarea
								id="feedback"
								placeholder="Detaylı geri bildiriminizi buraya yazabilirsiniz..."
								value={feedbackText}
								onChange={(e) => setFeedbackText(e.target.value)}
								rows={4}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
							/>
						</div>

						{/* Gönder Butonu */}
						<div className="flex justify-end gap-2">
							<Button 
								variant="outline" 
								onClick={() => setIsOpen(false)}
								disabled={createFeedbackMutation.isPending}
							>
								İptal
							</Button>
							<Button 
								onClick={handleSubmit} 
								disabled={createFeedbackMutation.isPending}
								className="bg-blue-600 hover:bg-blue-700"
							>
								<Send className="w-4 h-4 mr-2" />
								{createFeedbackMutation.isPending ? "Gönderiliyor..." : "Feedback Gönder"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}