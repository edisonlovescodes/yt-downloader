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
  resolution: string;
  quality: string;
}

interface CobaltResponse {
  status: string;
  url?: string;
  text?: string;
  picker?: Array<{ url: string; thumb?: string }>;
}

const COBALT_API = 'https://api.cobalt.tools';

/**
 * Get video information using Cobalt API
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    // Cobalt doesn't provide metadata in the initial request
    // We'll make a simple request to verify the URL works
    const response = await fetch(`${COBALT_API}/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        videoQuality: '1080',
        downloadMode: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.status}`);
    }

    const data: CobaltResponse = await response.json();

    if (data.status === 'error') {
      throw new Error(data.text || 'Failed to process video');
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);

    // Since Cobalt doesn't provide metadata, we'll create a basic response
    // In production, you might want to use YouTube Data API for metadata
    return {
      id: videoId,
      title: 'YouTube Video', // Cobalt doesn't provide title
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0, // Cobalt doesn't provide duration
      uploader: 'YouTube', // Cobalt doesn't provide uploader
      formats: [
        { format_id: '1080', resolution: '1920x1080', quality: '1080p (Full HD)' },
        { format_id: '720', resolution: '1280x720', quality: '720p (HD)' },
        { format_id: '480', resolution: '854x480', quality: '480p' },
        { format_id: '360', resolution: '640x360', quality: '360p' },
      ]
    };
  } catch (error: any) {
    console.error('Error getting video info:', error);
    throw new Error(`Failed to get video info: ${error.message}`);
  }
}

/**
 * Download video using Cobalt API
 */
export async function downloadVideo(
  url: string,
  quality: string = '720'
): Promise<{ filename: string; videoUrl: string }> {
  try {
    const response = await fetch(`${COBALT_API}/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        videoQuality: quality,
        downloadMode: 'auto',
        filenameStyle: 'basic'
      })
    });

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.status}`);
    }

    const data: CobaltResponse = await response.json();

    if (data.status === 'error') {
      throw new Error(data.text || 'Failed to download video');
    }

    if (data.status === 'picker' && data.picker && data.picker.length > 0) {
      // Multiple options available, return first one
      return {
        filename: `video-${Date.now()}.mp4`,
        videoUrl: data.picker[0].url
      };
    }

    if (data.status === 'tunnel' && data.url) {
      // Direct download URL from Cobalt
      return {
        filename: `video-${Date.now()}.mp4`,
        videoUrl: data.url
      };
    }

    if (data.status === 'redirect' && data.url) {
      // Redirect to external URL
      return {
        filename: `video-${Date.now()}.mp4`,
        videoUrl: data.url
      };
    }

    throw new Error('Unexpected response from Cobalt API');
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
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\?\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return 'unknown';
}

/**
 * Format duration from seconds to readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Unknown';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
