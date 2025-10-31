import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCompanyIdFromRequest, getExperienceIdFromRequest } from '@/lib/experience-context';
import { verifyUserToken } from '@/lib/whop-sdk';

type AppPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function AppLanding({ searchParams }: AppPageProps) {
  const headerList = headers();
  const verifiedUser = await verifyUserToken(headerList, { dontThrow: true });

  if (!verifiedUser) {
    return (
      <div className="min-h-screen bg-[#FCF6F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#141212] mb-2">
            Missing Whop session
          </h1>
          <p className="text-[#141212]/70">
            We could not verify your Whop user token. Please reopen this app from your Whop dashboard.
          </p>
        </div>
      </div>
    );
  }

  const experienceId = getExperienceIdFromRequest(headerList, searchParams);

  if (experienceId) {
    redirect(`/experience/${experienceId}`);
  }

  const rawCompanyHeader = getCompanyIdFromRequest(headerList, searchParams);

  return (
    <div className="min-h-screen bg-[#FCF6F5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full space-y-4">
        <h1 className="text-2xl font-bold text-[#141212]">
          Tell us which experience to launch
        </h1>
        <p className="text-[#141212]/70">
          We couldn&apos;t determine which Whop experience should open. This usually happens if the
          app link was opened outside of a Whop experience or the experience ID wasn&apos;t included in
          the request.
        </p>
        <div className="rounded-xl border border-[#141212]/10 bg-[#FCF6F5] p-4 text-sm text-[#141212]/80 space-y-2">
          <p className="font-semibold text-[#141212]">What to try:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Close this tab and reopen the app from the Whop dashboard.</li>
            <li>
              If you have a direct experience link, append{' '}
              <code className="font-mono text-xs bg-white px-1 py-0.5 rounded">
                ?experienceId=exp_xxx
              </code>{' '}
              to the URL.
            </li>
            <li>
              Contact the workspace owner to confirm the experience associated with this app and ensure the link was
              shared correctly.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-dashed border-[#141212]/20 p-4 text-sm">
          <p className="text-[#141212]/60">
            Debug details (for workspace owners):
          </p>
          <ul className="mt-2 space-y-1 text-[#141212]/50 font-mono text-xs">
            <li>User ID: {verifiedUser.userId}</li>
            <li>App ID: {verifiedUser.appId}</li>
            <li>Company hint: {rawCompanyHeader ?? 'n/a'}</li>
            <li>Experience header: none provided</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
