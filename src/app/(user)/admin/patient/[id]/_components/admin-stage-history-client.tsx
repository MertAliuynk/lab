"use client";

import AttachmentGallery from "@/components/attachment-gallery";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { History, Trash2 } from "lucide-react";
import { useState } from "react";

type StageHistoryEntry = {
	id: string;
	prosthesisStage: {
		name: string;
	} | null;
	createdAt: Date;
	notes: string | null;
	laboratoryTechnician: {
		user: {
			name: string;
		};
	} | null;
};

export const AdminStageHistoryClient = ({ dentalWorkId }: { dentalWorkId: string }) => {
	const { data: stageHistory = [], refetch } = api.admin.dentalWork.getStageHistory.useQuery({ dentalWorkId });
	const { mutateAsync: deleteStageHistory, isPending } = api.admin.dentalWork.deleteStageHistory.useMutation();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleDelete = async (stageHistoryId: string) => {
		try {
			setDeletingId(stageHistoryId);
			await deleteStageHistory({ stageHistoryId });
			await refetch();
		} catch (error) {
			console.error("Aşama silinirken hata oluştu:", error);
		} finally {
			setDeletingId(null);
		}
	};

	if (stageHistory.length === 0) {
		return null;
	}

		return (
			<div className="border-t pt-4">
				<h5 className="font-medium text-sm mb-3 flex items-center">
					<History className="w-4 h-4 mr-1" />
					Aşama Geçmişi
					<Badge variant="destructive" className="ml-2 text-xs">
						Admin Görünümü
					</Badge>
				</h5>
				<div className="space-y-3 max-h-60 overflow-y-auto">
					{stageHistory.map((entry: StageHistoryEntry, idx: number) => {
						const isLast = idx === 0; // Son eklenen en başta (sıralama desc ise)
						return (
							<div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50/50">
								<div className="flex-1">
									<div className="flex items-center space-x-2 mb-1">
										<Badge variant="secondary" className="text-xs">
											{entry.prosthesisStage?.name || "Bilinmeyen Aşama"}
										</Badge>
										<span className="text-xs text-muted-foreground">
											{new Date(entry.createdAt).toLocaleDateString("tr-TR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
									{entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
									{entry.laboratoryTechnician && (
										<p className="text-xs text-blue-600 mt-1">Teknisyen: {entry.laboratoryTechnician.user.name}</p>
									)}
									{(() => {
										const entryAttachments = (entry as Record<string, unknown>).attachments;
										if (Array.isArray(entryAttachments) && entryAttachments.length > 0) {
											const validAttachments = entryAttachments.filter(
												(att): att is { url: string; name: string; type: "image" | "video" } =>
													typeof att === "object" &&
													att !== null &&
													"url" in att &&
													"name" in att &&
													"type" in att &&
													typeof (att as Record<string, unknown>).url === "string" &&
													typeof (att as Record<string, unknown>).name === "string" &&
													((att as Record<string, unknown>).type === "image" ||
														(att as Record<string, unknown>).type === "video"),
											);
											if (validAttachments.length > 0) {
												return (
													<div className="mt-2">
														<AttachmentGallery attachments={validAttachments} compact={true} />
													</div>
												);
											}
										}
										return null;
									})()}
								</div>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="destructive"
											size="icon"
											className="h-8 w-8"
											disabled={!isLast || (isPending && deletingId === entry.id)}
											aria-label="Aşamayı Sil"
											tabIndex={0}
										>
											{isPending && deletingId === entry.id ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
											) : (
												<Trash2 className="w-4 h-4" />
											)}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Aşamayı Sil</AlertDialogTitle>
											<AlertDialogDescription>
												Bu aşamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
												<br />
												<br />
												<strong>Aşama:</strong> {entry.prosthesisStage?.name || "Bilinmeyen Aşama"}
												<br />
												<strong>Tarih:</strong>{" "}
												{new Date(entry.createdAt).toLocaleDateString("tr-TR", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>İptal</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => handleDelete(entry.id)}
												className="bg-destructive hover:bg-destructive/90"
											>
												Evet, Sil
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						);
					})}
				</div>
			</div>
		);
};
