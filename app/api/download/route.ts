import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo, isValidYouTubeUrl } from '@/lib/cobalt-api';

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

    // Get download URL from Cobalt API
    const { videoUrl } = await downloadVideo(url, selectedQuality);

    // Return the video URL for client-side download
    // The client will handle the actual download
    return NextResponse.json({
      success: true,
      downloadUrl: videoUrl
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

// Note: On Vercel Hobby, max duration is 10 seconds
// Upgrade to Pro for longer timeouts (up to 60 seconds)
