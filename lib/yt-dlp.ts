import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: VideoFormat[];
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  filesize?: number;
}

/**
 * Get video information using yt-dlp
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    // Use yt-dlp to get video info in JSON format
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-playlist "${url}"`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    const data = JSON.parse(stdout);

    // Filter for video+audio formats
    const formats = (data.formats || [])
      .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none')
      .map((f: any) => ({
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || `${f.width}x${f.height}`,
        filesize: f.filesize,
      }))
      .filter((f: VideoFormat) => f.resolution && f.resolution !== 'x');

    return {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      duration: data.duration,
      uploader: data.uploader,
      formats,
    };
  } catch (error: any) {
    console.error('Error getting video info:', error);
    throw new Error(`Failed to get video info: ${error.message}`);
  }
}

/**
 * Download video with specified quality
 */
export async function downloadVideo(
  url: string,
  quality: string = '720'
): Promise<{ filename: string; buffer: Buffer }> {
  try {
    // Download to temp file
    const timestamp = Date.now();
    const outputTemplate = `/tmp/yt-${timestamp}.%(ext)s`;

    // Use yt-dlp to download video
    const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;

    const { stdout } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 100, // 100MB buffer
    });

    // Get the actual filename
    const filenameMatch = stdout.match(/Merging formats into "(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : `/tmp/yt-${timestamp}.mp4`;

    // Read the file
    const fs = require('fs');
    const buffer = fs.readFileSync(filename);

    // Clean up temp file
    fs.unlinkSync(filename);

    return {
      filename: `video-${timestamp}.mp4`,
      buffer,
    };
  } catch (error: any) {
    console.error('Error downloading video:', error);
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];

  return patterns.some(pattern => pattern.test(url));
}

/**
 * Format duration from seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
