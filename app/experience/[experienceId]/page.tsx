import { getOptionalSession } from '@/lib/session';
import VideoDownloader from '@/components/video-downloader';

export default async function ExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  console.log('[experience] Loading experience:', params.experienceId);

  // Get session using the proven macro-tracker pattern
  const session = await getOptionalSession({ experienceId: params.experienceId });

  if (!session) {
    console.error('[experience] No valid session found');
    return (
      <div className="min-h-screen bg-[#FCF6F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FA4616] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#141212] mb-2">Authentication Error</h1>
          <p className="text-[#141212]/70">Failed to verify your credentials. Please try again.</p>
        </div>
      </div>
    );
  }

  console.log('[experience] Valid session for user:', session.userId);

  // If token verification succeeds, show the downloader
  return (
    <div className="min-h-screen bg-[#FCF6F5]">
      <VideoDownloader userId={session.userId} />
    </div>
  );
}
