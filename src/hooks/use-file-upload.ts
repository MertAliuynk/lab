import { useState } from "react";
import { toast } from "sonner";

interface UploadedFile {
	url: string;
	name: string;
	type: "image" | "video";
}

export const useFileUpload = () => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

	const uploadFile = async (file: File): Promise<UploadedFile | null> => {
		try {
			setIsUploading(true);

			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Yükleme hatası");
			}

			const result = await response.json();

			const uploadedFile: UploadedFile = {
				url: result.url,
				name: file.name,
				type: file.type.startsWith("image/") ? "image" : "video",
			};

			setUploadedFiles((prev) => [...prev, uploadedFile]);
			toast.success("Dosya başarıyla yüklendi");

			return uploadedFile;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Yükleme hatası");
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	const removeFile = (url: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file.url !== url));
		toast.success("Dosya silindi");
	};

	const clearFiles = () => {
		setUploadedFiles([]);
	};

	return {
		uploadFile,
		removeFile,
		clearFiles,
		isUploading,
		uploadedFiles,
		setUploadedFiles,
	};
};
