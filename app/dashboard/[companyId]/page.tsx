import { redirect } from 'next/navigation';

type DashboardCompanyPageProps = {
  params: {
    companyId: string;
  };
};

export default function DashboardCompanyPage({ params }: DashboardCompanyPageProps) {
  const { companyId } = params;
  redirect(`/app?companyId=${encodeURIComponent(companyId)}`);
}
