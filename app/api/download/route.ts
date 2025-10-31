import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo, isValidYouTubeUrl } from '@/lib/yt-dlp';

export async function POST(request: NextRequest) {
  try {
    const { url, quality } = await request.json();

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check if valid YouTube URL
    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Validate quality
    const validQualities = ['1080', '720', '480', '360'];
    const selectedQuality = quality && validQualities.includes(quality) ? quality : '720';

    // Download video using yt-dlp
    const { filename, buffer } = await downloadVideo(url, selectedQuality);

    // Return the video as a downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error in download API:', error);

    return NextResponse.json(
      {
        error: 'Failed to download video',
        details: error.message
      },
      { status: 500 }
    );
  }
}
