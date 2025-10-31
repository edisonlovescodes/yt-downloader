import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo, isValidYouTubeUrl } from '@/lib/yt-dlp';
import { verifyUserToken } from '@/lib/whop-sdk';

export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await verifyUserToken(request, { dontThrow: true });

    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Whop user token is required' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

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

    // Get video information
    const videoInfo = await getVideoInfo(url);

    return NextResponse.json({
      success: true,
      data: videoInfo,
    });
  } catch (error: any) {
    console.error('Error in video-info API:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch video information',
        details: error.message
      },
      { status: 500 }
    );
  }
}
