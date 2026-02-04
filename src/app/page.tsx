import { auth } from '@insforge/nextjs/server';
import { LandingPage } from '@/components/landing/LandingPage';
import UserDashboard from '@/components/dashboard/UserDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { token } = await auth().catch(() => ({ token: null }));

  if (token) {
    return <UserDashboard />;
  }

  return <LandingPage />;
}
