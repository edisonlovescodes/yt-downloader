import { headers } from 'next/headers';
import { verifyUserToken, getWhopSdk } from '@/lib/whop-sdk';
import VideoDownloader from '@/components/video-downloader';

export default async function ExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  try {
    // Verify user token - this ensures the user is authenticated
    const headerList = await headers();

    // Debug: Log all headers to see what we're receiving
    const headersObj: Record<string, string> = {};
    headerList.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log('Received headers:', Object.keys(headersObj));
    console.log('Has x-whop-user-token:', headersObj['x-whop-user-token'] ? 'YES' : 'NO');

    const verifiedUser = await verifyUserToken(headerList, { dontThrow: true });

    if (!verifiedUser) {
      console.error('Authentication failed: No verified user');
      console.error('Available headers:', Object.keys(headersObj));
      throw new Error('Missing or invalid Whop user token');
    }

    const { userId } = verifiedUser;
    console.log('User verified:', userId);

    // Verify user has access to this experience
    const whopSdk = getWhopSdk();
    try {
      const accessCheck = await whopSdk.access.checkIfUserHasAccessToExperience({
        experienceId: params.experienceId,
        userId,
      });

      if (!accessCheck.hasAccess) {
        console.error(`Access denied: User ${userId} does not have access to experience ${params.experienceId}`);
        return (
          <div className="min-h-screen bg-[#FCF6F5] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-[#FA4616] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#141212] mb-2">Access Denied</h1>
              <p className="text-[#141212]/70">You don&apos;t have access to this experience. Please purchase access to continue.</p>
            </div>
          </div>
        );
      }
    } catch (accessError) {
      console.error('Error checking access:', accessError);
      // If access check fails, we'll allow access but log the error
      // This prevents blocking users if the access check API has issues
    }

    // If token verification succeeds, show the downloader
    return (
      <div className="min-h-screen bg-[#FCF6F5]">
        <VideoDownloader userId={userId} />
      </div>
    );
  } catch (error) {
    console.error('Error in experience page:', error);
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
}
