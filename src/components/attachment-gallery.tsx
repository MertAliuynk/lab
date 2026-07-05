"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/utils";
import { Camera, Download, FileVideo } from "lucide-react";

interface Attachment {
	url: string;
	name: string;
	type: "image" | "video";
}

interface AttachmentGalleryProps {
	attachments: Attachment[];
	compact?: boolean;
}

export default function AttachmentGallery({ attachments, compact = false }: AttachmentGalleryProps) {
	if (!attachments || attachments.length === 0) {
		return null;
	}

	const handleDownload = (attachment: Attachment) => {
		const link = document.createElement("a");
		link.href = attachment.url;
		link.download = attachment.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (compact) {
		return (
			<div className="flex items-center gap-2">
				{attachments.slice(0, 4).map((attachment, index) => (
					<div key={`${attachment.url}-${index}`} className="relative group">
						<Dialog>
							<DialogTrigger asChild>
								<div className="cursor-pointer">
									{attachment.type === "image" ? (
										<div className="w-8 h-8 bg-muted/50 rounded overflow-hidden">
											<img
												src={getImageUrl(attachment.url)}
												alt={attachment.name}
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-8 h-8 bg-muted/50 rounded overflow-hidden relative">
											<video
												src={getImageUrl(attachment.url)}
												className="w-full h-full object-cover"
												preload="metadata"
											>
												<track kind="captions" srcLang="tr" label="Türkçe" />
											</video>
											<FileVideo className="absolute top-1 left-1 h-2 w-2 text-white bg-black/50 rounded p-0.5" />
										</div>
									)}
								</div>
							</DialogTrigger>
							<DialogContent className="max-w-4xl max-h-[80vh]">
								<DialogTitle className="sr-only">Ek Dosya: {attachment.name}</DialogTitle>
								<div className="flex flex-col items-center">
									{attachment.type === "image" ? (
										<img
											src={getImageUrl(attachment.url)}
											alt={attachment.name}
											className="max-w-full max-h-[60vh] object-contain"
										/>
									) : (
										<video
											src={getImageUrl(attachment.url)}
											className="max-w-full max-h-[60vh] object-contain"
											controls
											autoPlay
										>
											<track kind="captions" srcLang="tr" label="Türkçe" />
										</video>
									)}
									<div className="mt-4 flex items-center justify-between w-full">
										<p className="text-sm text-muted-foreground">{attachment.name}</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownload(attachment)}
											className="flex items-center gap-2"
										>
											<Download className="h-4 w-4" />
											İndir
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				))}
				{attachments.length > 4 && (
					<div className="w-8 h-8 bg-muted/50 rounded flex items-center justify-center">
						<span className="text-xs font-medium">+{attachments.length - 4}</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-3 gap-3">
				{attachments.slice(0, 6).map((attachment, index) => (
					<div key={`${attachment.url}-${index}`} className="relative group cursor-pointer">
						<Dialog>
							<DialogTrigger asChild>
								<div>
									{attachment.type === "image" ? (
										<div className="aspect-video bg-muted/50 rounded-lg overflow-hidden">
											<img
												src={getImageUrl(attachment.url)}
												alt={attachment.name}
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
											<Camera className="absolute top-2 left-2 h-4 w-4 text-white bg-black/50 rounded p-1" />
										</div>
									) : (
										<div className="aspect-video bg-muted/50 rounded-lg overflow-hidden relative">
											<video
												src={getImageUrl(attachment.url)}
												className="w-full h-full object-cover"
												preload="metadata"
											>
												<track kind="captions" srcLang="tr" label="Türkçe" />
											</video>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
											<FileVideo className="absolute top-2 left-2 h-4 w-4 text-white bg-black/50 rounded p-1" />
										</div>
									)}
								</div>
							</DialogTrigger>
							<DialogContent className="max-w-4xl max-h-[80vh]">
								<DialogTitle className="sr-only">Ek Dosya: {attachment.name}</DialogTitle>
								<div className="flex flex-col items-center">
									{attachment.type === "image" ? (
										<img
											src={getImageUrl(attachment.url)}
											alt={attachment.name}
											className="max-w-full max-h-[60vh] object-contain"
										/>
									) : (
										<video
											src={getImageUrl(attachment.url)}
											className="max-w-full max-h-[60vh] object-contain"
											controls
											autoPlay
										>
											<track kind="captions" srcLang="tr" label="Türkçe" />
										</video>
									)}
									<div className="mt-4 flex items-center justify-between w-full">
										<p className="text-sm text-muted-foreground">{attachment.name}</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownload(attachment)}
											className="flex items-center gap-2"
										>
											<Download className="h-4 w-4" />
											İndir
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				))}

				{attachments.length > 6 && (
					<div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
						<div className="text-center">
							<span className="text-sm font-medium">+{attachments.length - 6}</span>
							<p className="text-xs text-muted-foreground">daha fazla</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
