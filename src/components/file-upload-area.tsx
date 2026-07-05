"use client";

import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getImageUrl } from "@/lib/utils";
import { Camera, FileVideo, Trash2, Upload } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface FileUploadAreaProps {
	onFilesChange?: (files: Array<{ url: string; name: string; type: "image" | "video" }>) => void;
}

export interface FileUploadAreaRef {
	clearFiles: () => void;
}

const FileUploadArea = forwardRef<FileUploadAreaRef, FileUploadAreaProps>(({ onFilesChange }, ref) => {
	const { uploadFile, removeFile, clearFiles, isUploading, uploadedFiles } = useFileUpload();
	const fileInputRef = useRef<HTMLInputElement>(null);

	useImperativeHandle(ref, () => ({
		clearFiles: () => {
			clearFiles();
			if (onFilesChange) {
				onFilesChange([]);
			}
		},
	}));

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		for (const file of Array.from(files)) {
			const result = await uploadFile(file);
			if (result && onFilesChange) {
				onFilesChange([...uploadedFiles, result]);
			}
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveFile = (url: string) => {
		removeFile(url);
		if (onFilesChange) {
			const updatedFiles = uploadedFiles.filter((file) => file.url !== url);
			onFilesChange(updatedFiles);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleUploadClick}
					disabled={isUploading}
					className="flex items-center gap-2"
				>
					{isUploading ? (
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
					) : (
						<Upload className="h-4 w-4" />
					)}
					{isUploading ? "Yükleniyor..." : "Dosya Ekle"}
				</Button>
				<span className="text-xs text-muted-foreground">Fotoğraf veya video ekleyebilirsiniz</span>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*,video/*"
				multiple
				className="hidden"
				onChange={handleFileSelect}
			/>

			{uploadedFiles.length > 0 && (
				<div className="grid grid-cols-2 gap-3">
					{uploadedFiles.map((file, index) => (
						<div
							key={`${file.url}-${index}`}
							className="relative group rounded-lg border border-border overflow-hidden"
						>
							{file.type === "image" ? (
								<div className="aspect-video bg-muted/50 flex items-center justify-center relative">
									<img src={getImageUrl(file.url)} alt={file.name} className="max-w-full max-h-full object-contain" />
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
									<Camera className="absolute top-2 left-2 h-4 w-4 text-white bg-black/50 rounded p-1" />
								</div>
							) : (
								<div className="aspect-video bg-muted/50 flex items-center justify-center relative">
									<video src={file.url} className="max-w-full max-h-full object-contain" controls preload="metadata">
										<track kind="captions" srcLang="tr" label="Türkçe" />
									</video>
									<FileVideo className="absolute top-2 left-2 h-4 w-4 text-white bg-black/50 rounded p-1" />
								</div>
							)}

							<div className="p-2 bg-background border-t">
								<p className="text-xs text-muted-foreground truncate" title={file.name}>
									{file.name}
								</p>
								<div className="flex items-center justify-between mt-1">
									<span className="text-xs px-2 py-1 bg-muted rounded">
										{file.type === "image" ? "Fotoğraf" : "Video"}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveFile(file.url)}
										className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{uploadedFiles.length === 0 && (
				<button
					type="button"
					className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors bg-transparent"
					onClick={handleUploadClick}
					aria-label="Fotoğraf veya video yükle"
				>
					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Camera className="h-5 w-5" />
							<FileVideo className="h-5 w-5" />
						</div>
						<p className="text-sm text-muted-foreground">Fotoğraf veya video eklemek için tıklayın</p>
						<p className="text-xs text-muted-foreground">Desteklenen formatlar: JPG, PNG, MP4, AVI, MOV</p>
					</div>
				</button>
			)}
		</div>
	);
});

FileUploadArea.displayName = "FileUploadArea";

export default FileUploadArea;
