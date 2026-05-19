// utils/alicia-utils.js
// ALICIAH AI - Unique Utility Functions
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execPromise = promisify(exec);

// Generate random filename
export const randomFile = (ext) => {
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex');
    const tempDir = path.join(process.cwd(), 'temp');
    return path.join(tempDir, `${timestamp}_${random}${ext}`);
};

// Ensure temp directory exists
export const ensureTempDir = async () => {
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
};

// Get video duration
export const getVideoDuration = async (filePath) => {
    try {
        const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
        return parseFloat(stdout);
    } catch {
        return 8;
    }
};

// Convert video to WebP sticker
export const videoToWebP = async (input, output, width = 512, fps = 15, duration = 10) => {
    await execPromise(`ffmpeg -i "${input}" -vcodec libwebp -vf "scale=${width}:-1,fps=${fps}" -loop 0 -ss 0 -t ${duration} -preset default -an -vsync 0 "${output}" -y`);
};

// Convert image to WebP sticker
export const imageToWebP = async (input, output, width = 512) => {
    await sharp(input)
        .resize(width, width, { fit: 'contain', background: '#ffffff' })
        .webp({ quality: 85 })
        .toFile(output);
};

// Sticker to image
export const stickerToImage = async (stickerBuffer) => {
    return await sharp(stickerBuffer).png().toBuffer();
};

// Video to Audio (MP3)
export const videoToAudio = async (videoBuffer) => {
    await ensureTempDir();
    const inputFile = randomFile('.mp4');
    const outputFile = randomFile('.mp3');
    
    await fs.writeFile(inputFile, videoBuffer);
    await execPromise(`ffmpeg -i "${inputFile}" -q:a 0 -map a "${outputFile}" -y`);
    const audioBuffer = await fs.readFile(outputFile);
    
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return audioBuffer;
};

// Audio to Voice Note (PTT)
export const audioToPTT = async (audioBuffer) => {
    await ensureTempDir();
    const inputFile = randomFile('.mp3');
    const outputFile = randomFile('.opus');
    
    await fs.writeFile(inputFile, audioBuffer);
    await execPromise(`ffmpeg -i "${inputFile}" -c:a libopus -b:a 16k -ar 16000 -ac 1 "${outputFile}" -y`);
    const pttBuffer = await fs.readFile(outputFile);
    
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return pttBuffer;
};

// Audio to Video (Black Screen)
export const audioToVideo = async (audioBuffer) => {
    await ensureTempDir();
    const inputFile = randomFile('.mp3');
    const outputFile = randomFile('.mp4');
    
    await fs.writeFile(inputFile, audioBuffer);
    await execPromise(`ffmpeg -f lavfi -i color=c=black:s=1280x720 -i "${inputFile}" -shortest -c:v libx264 -c:a aac -pix_fmt yuv420p "${outputFile}" -y`);
    const videoBuffer = await fs.readFile(outputFile);
    
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return videoBuffer;
};

// Download media from URL
export const downloadMedia = async (url) => {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
};

// Download and save media message
export const downloadAndSaveMedia = async (mediaMsg) => {
    const url = mediaMsg.url;
    if (!url) throw new Error('No media URL found');
    
    const buffer = await downloadMedia(url);
    const tempFile = randomFile('.tmp');
    await fs.writeFile(tempFile, buffer);
    
    return tempFile;
};

// Format bytes
export const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} bytes`;
};

// Sleep/Delay
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random string
export const randomString = (length = 8) => randomBytes(length).toString('hex');

// Clean up temp files
export const cleanup = async (filePaths) => {
    for (const file of filePaths) {
        await fs.unlink(file).catch(() => {});
    }
};

// ALICIAH AI branding
export const ALICIAH_BRANDING = '> alicia  ALICIAH | CASPER TECH';
export const BOT_NAME = 'ALICIAH AI';
export const BOT_VERSION = '2.0.0';
