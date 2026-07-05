import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { slugify } from "@/lib/utils";

const s3Client = new S3Client({
	endpoint: process.env.MINIO_URL,
	region: "auto",
	credentials: {
		accessKeyId: process.env.MINIO_ACCESS_KEY ?? "",
		secretAccessKey: process.env.MINIO_SECRET_KEY ?? "",
	},
	forcePathStyle: true,
});

interface UploadResult {
	url: string;
}

const isImageFile = (fileName: string): boolean => {
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
	const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
	return imageExtensions.includes(extension);
};

const isVideoFile = (fileName: string): boolean => {
	const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".m4v"];
	const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
	return videoExtensions.includes(extension);
};

async function processImage(buffer: Buffer): Promise<Buffer> {
	return await sharp(buffer, { failOn: "none" }).withMetadata().webp({ quality: 100, effort: 6 }).toBuffer();
}

async function processVideo(file: File): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const tempDir = join(tmpdir(), "video-processing");
		if (!existsSync(tempDir)) {
			mkdirSync(tempDir, { recursive: true });
		}

		const inputPath = join(tempDir, `input-${Date.now()}.tmp`);
		const outputPath = join(tempDir, `output-${Date.now()}.mp4`);

		file
			.arrayBuffer()
			.then((arrayBuffer) => {
				const buffer = Buffer.from(arrayBuffer);
				const writeStream = createWriteStream(inputPath);

				writeStream.write(buffer);
				writeStream.end();

				writeStream.on("finish", () => {
					ffmpeg(inputPath)
						.output(outputPath)
						.videoCodec("libx264")
						.audioCodec("aac")
						.size("1280x720")
						.videoBitrate("1000k")
						.audioBitrate("128k")
						.on("end", () => {
							import("node:fs").then((fs) => {
								const processedBuffer = fs.readFileSync(outputPath);

								unlinkSync(inputPath);
								unlinkSync(outputPath);

								resolve(processedBuffer);
							});
						})
						.on("error", (err) => {
							try {
								unlinkSync(inputPath);
								unlinkSync(outputPath);
							} catch {}
							reject(err);
						})
						.run();
				});

				writeStream.on("error", reject);
			})
			.catch(reject);
	});
}

async function uploadToMinio(file: File): Promise<UploadResult> {
	try {
		const slug = slugify(file.name.split(".")[0] ?? "");
		let processedBuffer: Buffer;
		let fileName: string;
		let contentType: string;

		if (isImageFile(file.name)) {
			const buffer = Buffer.from(await file.arrayBuffer());
			processedBuffer = await processImage(buffer);
			fileName = `${slug}-${Date.now()}.webp`;
			contentType = "image/webp";
		} else if (isVideoFile(file.name)) {
			processedBuffer = await processVideo(file);
			fileName = `${slug}-${Date.now()}.mp4`;
			contentType = "video/mp4";
		} else {
			throw new Error("Desteklenmeyen dosya türü");
		}

		await s3Client.send(
			new PutObjectCommand({
				Bucket: process.env.MINIO_BUCKET,
				Key: fileName,
				Body: processedBuffer,
				ContentType: contentType,
			}),
		);

		return {
			url: `/${process.env.MINIO_BUCKET}/${fileName}`,
		};
	} catch (error: unknown) {
		throw new Error(error instanceof Error ? error.message : "Bilinmeyen hata");
	}
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ error: "Dosya bulunamadı" },
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (!isImageFile(file.name) && !isVideoFile(file.name)) {
			return NextResponse.json(
				{ error: "Sadece resim ve video dosyaları kabul edilir" },
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const uploadResult = await uploadToMinio(file);

		return NextResponse.json(
			{
				url: uploadResult.url,
			},
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Yükleme hatası:", error);
		return NextResponse.json(
			{ error: "Yükleme hatası" },
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
