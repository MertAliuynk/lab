"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const addFavoriteSchema = z.object({
	prosthesisTypeId: z.string().min(1, "Protez tipi seçimi zorunludur"),
});

type AddFavoriteFormData = z.infer<typeof addFavoriteSchema>;

export default function FavoriteProsthesisTypePage() {
	const [isOpen, setIsOpen] = useState(false);
	const utils = api.useUtils();

	const form = useForm<AddFavoriteFormData>({
		resolver: zodResolver(addFavoriteSchema),
		defaultValues: {
			prosthesisTypeId: "",
		},
	});

	// Favorileri getir
	const { data: favorites = [], isLoading: favoritesLoading } = 
		api.admin.favoriteProsthesisType.getAll.useQuery({
			page: 1,
			perPage: 100,
		});

	// Tüm protez tiplerini getir
	const { data: allProsthesisTypes = [], isLoading: prosthesisTypesLoading } = 
		api.admin.prosthesisType.getAll.useQuery({
			page: 1,
			perPage: 100,
		});

	// Favori ekleme mutation
	const addFavoriteMutation = api.admin.favoriteProsthesisType.add.useMutation({
		onSuccess: async () => {
			toast.success("Favori başarıyla eklendi!");
			form.reset();
			setIsOpen(false);
			await utils.admin.favoriteProsthesisType.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Favori eklenirken hata oluştu");
		},
	});

	// Favori silme mutation
	const removeFavoriteMutation = api.admin.favoriteProsthesisType.remove.useMutation({
		onSuccess: async () => {
			toast.success("Favori başarıyla silindi!");
			await utils.admin.favoriteProsthesisType.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Favori silinirken hata oluştu");
		},
	});

	// Sıra güncelleme mutation
	const updateOrderMutation = api.admin.favoriteProsthesisType.updateOrder.useMutation({
		onSuccess: async () => {
			await utils.admin.favoriteProsthesisType.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Sıra güncellenirken hata oluştu");
		},
	});

	const onSubmit = (data: AddFavoriteFormData) => {
		addFavoriteMutation.mutate({
			prosthesisTypeId: data.prosthesisTypeId,
		});
	};

	const handleRemoveFavorite = (id: string) => {
		if (window.confirm("Bu favoriyi silmek istediğinizden emin misiniz?")) {
			removeFavoriteMutation.mutate({ id });
		}
	};

	const moveUp = (index: number) => {
		if (index > 0) {
			const currentFavorite = favorites[index];
			const newOrder = favorites[index - 1]?.order || 0;
			if (currentFavorite) {
				updateOrderMutation.mutate({
					id: currentFavorite.id,
					order: newOrder - 1,
				});
			}
		}
	};

	const moveDown = (index: number) => {
		if (index < favorites.length - 1) {
			const currentFavorite = favorites[index];
			const newOrder = favorites[index + 1]?.order || 0;
			if (currentFavorite) {
				updateOrderMutation.mutate({
					id: currentFavorite.id,
					order: newOrder + 1,
				});
			}
		}
	};

	// Favorilerde olmayan protez tiplerini filtrele
	const availableProsthesisTypes = allProsthesisTypes.filter(
		type => !favorites.some(fav => fav.prosthesisType.id === type.id)
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Favori Protez Tipleri</h1>
					<p className="text-muted-foreground">
						Doktorların protez eklerken öncelikli görmeleri için favori protez tiplerini yönetin.
					</p>
				</div>

				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Favori Ekle
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Favori Protez Tipi Ekle</DialogTitle>
							<DialogDescription>
								Doktorların öncelikli görmesi için bir protez tipini favorilere ekleyin.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="prosthesisTypeId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Protez Tipi</FormLabel>
											<Select value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Protez tipi seçin" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{availableProsthesisTypes.map((type) => (
														<SelectItem key={type.id} value={type.id}>
															{type.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsOpen(false)}
									>
										İptal
									</Button>
									<Button 
										type="submit" 
										disabled={addFavoriteMutation.isPending}
									>
										{addFavoriteMutation.isPending ? "Ekleniyor..." : "Ekle"}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Star className="h-5 w-5 text-yellow-500" />
						Favori Protez Tipleri ({favorites.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{favoritesLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 3 }, (_, i) => (
								<div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
									<div className="h-4 w-4 bg-gray-300 rounded"></div>
									<div className="flex-1 h-4 bg-gray-300 rounded"></div>
									<div className="h-8 w-20 bg-gray-300 rounded"></div>
								</div>
							))}
						</div>
					) : favorites.length === 0 ? (
						<div className="text-center py-8">
							<Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Henüz favori yok</h3>
							<p className="text-muted-foreground mb-4">
								Doktorların öncelikli görmesi için protez tiplerini favorilere ekleyin.
							</p>
							<Button onClick={() => setIsOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								İlk Favoriyi Ekle
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							{favorites.map((favorite, index) => (
								<div
									key={favorite.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
								>
									<div className="flex items-center gap-4">
										<div className="flex flex-col gap-1">
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={() => moveUp(index)}
												disabled={index === 0 || updateOrderMutation.isPending}
											>
												<GripVertical className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={() => moveDown(index)}
												disabled={index === favorites.length - 1 || updateOrderMutation.isPending}
											>
												<GripVertical className="h-3 w-3" />
											</Button>
										</div>
										
										<Star className="h-5 w-5 text-yellow-500" />
										
										<div>
											<h3 className="font-medium">{favorite.prosthesisType.name}</h3>
											{favorite.prosthesisType.description && (
												<p className="text-sm text-muted-foreground">
													{favorite.prosthesisType.description}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Badge variant="secondary">
											Sıra: {index + 1}
										</Badge>
										
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveFavorite(favorite.id)}
											disabled={removeFavoriteMutation.isPending}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}