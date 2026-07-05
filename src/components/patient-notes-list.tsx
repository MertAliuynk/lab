"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatTime } from "@/lib/format";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, FileText, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	content: z.string().min(1, "Not içeriği boş bırakılamaz"),
});

interface PatientNotesListProps {
	patientId: string;
}

export default function PatientNotesList({ patientId }: PatientNotesListProps) {
	const pathname = usePathname();
	const isAdmin = pathname.includes("/admin/");
	const isTechnician = pathname.includes("/teknisyen/");

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);
	const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

	const { data: patientNotes, refetch } = isAdmin
		? api.admin.patientNote.getByPatientId.useQuery({ patientId })
		: isTechnician
		? api.laboratoryTechnician.patientNote.getByPatientId.useQuery({ patientId })
		: api.dentist.patientNote.getByPatientId.useQuery({ patientId });

	const { mutateAsync: createNote, isPending: isCreating } = api.dentist.patientNote.create.useMutation();
	const { mutateAsync: updateNote, isPending: isUpdating } = api.dentist.patientNote.update.useMutation();
	const { mutateAsync: deleteNote } = api.dentist.patientNote.delete.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	});

	const handleCreateNote = async (values: z.infer<typeof formSchema>) => {
		try {
			await createNote({
				patientId,
				content: values.content,
			});

			toast.success("Hasta notu başarıyla eklendi");
			setIsAddDialogOpen(false);
			form.reset();
			refetch();
		} catch {
			toast.error("Hasta notu eklenirken bir hata oluştu");
		}
	};

	const handleUpdateNote = async (values: z.infer<typeof formSchema>) => {
		if (!editingNote) return;

		try {
			await updateNote({
				id: editingNote.id,
				content: values.content,
			});

			toast.success("Hasta notu başarıyla güncellendi");
			setEditingNote(null);
			form.reset();
			refetch();
		} catch {
			toast.error("Hasta notu güncellenirken bir hata oluştu");
		}
	};

	const handleDeleteNote = (noteId: string) => {
		setDeleteNoteId(noteId);
	};

	const confirmDeleteNote = async () => {
		if (!deleteNoteId) return;

		try {
			await deleteNote({ id: deleteNoteId });
			toast.success("Hasta notu başarıyla silindi");
			setDeleteNoteId(null);
			refetch();
		} catch {
			toast.error("Hasta notu silinirken bir hata oluştu");
		}
	};

	const openEditDialog = (note: { id: string; content: string }) => {
		setEditingNote(note);
		form.reset({ content: note.content });
	};

	const closeDialogs = () => {
		setIsAddDialogOpen(false);
		setEditingNote(null);
		form.reset();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-lg">
					<div className="flex items-center">
						<FileText className="w-5 h-5 mr-2 text-purple-600" />
						Hasta Notları
					</div>
					{!isAdmin && !isTechnician && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsAddDialogOpen(true)}
							className="flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Yeni Not Ekle
						</Button>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{!patientNotes || patientNotes.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
							<FileText className="w-6 h-6 text-purple-600" />
						</div>
						<h4 className="font-medium mb-2">Henüz hasta notu bulunmuyor</h4>
						<p className="text-sm text-muted-foreground mb-4">Bu hasta için özel notlar ekleyebilirsiniz</p>
					</div>
				) : (
					<div className="space-y-3">
						{patientNotes.map((note) => (
							<div
								key={note.id}
								className="bg-gradient-to-r relative from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500"
							>
								{!isAdmin && !isTechnician && (
									<div className="flex items-center space-x-1 absolute top-0 right-0">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => openEditDialog({ id: note.id, content: note.content })}
											className="h-8 w-8 p-0"
										>
											<Edit3 className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteNote(note.id)}
											className="h-8 w-8 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								)}
								<p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
								{note.updatedAt !== note.createdAt && (
									<p className="text-xs text-muted-foreground mt-2">
										Son düzenleme: {formatDate(note.updatedAt)} {formatTime(note.updatedAt)}
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>

			{!isAdmin && !isTechnician && (
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Plus className="w-5 h-5 text-purple-600" />
								Yeni Hasta Notu Ekle
							</DialogTitle>
							<DialogDescription>Bu hasta için yeni bir not ekleyebilirsiniz.</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleCreateNote)} className="space-y-4">
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Not</FormLabel>
											<FormControl>
												<Textarea {...field} placeholder="Not içeriği..." rows={4} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={isCreating} className="w-full">
									{isCreating ? "Ekleniyor..." : "Ekle"}
								</Button>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			)}

			<Dialog open={!!editingNote} onOpenChange={() => editingNote && closeDialogs()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit3 className="w-5 h-5 text-purple-600" />
							Hasta Notunu Düzenle
						</DialogTitle>
						<DialogDescription>Mevcut hasta notunu düzenleyip güncelleyebilirsiniz.</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleUpdateNote)} className="space-y-4">
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Not İçeriği</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Bu hasta hakkında özel notlarınızı yazabilirsiniz..."
												className="min-h-[120px] resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end space-x-2">
								<Button type="button" variant="outline" onClick={closeDialogs} disabled={isUpdating}>
									İptal
								</Button>
								<Button type="submit" loading={isUpdating}>
									Güncelle
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hasta Notunu Sil</AlertDialogTitle>
						<AlertDialogDescription>
							Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>İptal</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive hover:bg-destructive/90">
							Sil
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
