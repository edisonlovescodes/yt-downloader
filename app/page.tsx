export default function Home() {
  return (
    <div className="min-h-screen bg-[#FCF6F5] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-[#FA4616] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[#141212] mb-4">
          YouTube Video Downloader
        </h1>

        <p className="text-xl text-[#141212]/70 mb-8">
          A Whop App for downloading YouTube videos in high quality
        </p>

        <div className="bg-[#FCF6F5] rounded-xl p-6 mb-8">
          <p className="text-[#141212]/80 mb-4">
            This app is designed to be accessed through Whop experiences.
          </p>
          <p className="text-sm text-[#141212]/60">
            If you&apos;re a member, access the downloader through your Whop dashboard.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FA4616] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-[#141212]/70">Go to your Whop dashboard</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FA4616] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <p className="text-[#141212]/70">Find the YouTube Downloader experience</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FA4616] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <p className="text-[#141212]/70">Start downloading videos!</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#141212]/10">
          <p className="text-sm text-[#141212]/50">
            Powered by yt-dlp • Built for Whop
          </p>
        </div>
      </div>
    </div>
  );
}
