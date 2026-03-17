import { prisma } from '@/lib/prisma';
import JobList from '@/components/JobList';
import ProfileEditor from '@/components/ProfileEditor';
import SetupGuide from '@/components/SetupGuide';
import { getProfileData } from '@/lib/scoring';

export default async function Home(props: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await props.searchParams;
  const currentStatus = params.status || 'NEW';
  const currentPage = Math.max(1, parseInt(params.page || '1') || 1);
  const pageSize = 15;
  
  const totalJobsCount = await prisma.job.count();
  const filteredJobsCount = await prisma.job.count({
    where: { status: currentStatus }
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobsCount / pageSize));
  const profile = getProfileData();
  const profileHasSkills = profile.keywords.length > 5; // Simple heuristic

  const orderBy = [
    { status_updated_at: 'desc' as const },
    { match_score: 'desc' as const },
    { id: 'desc' as const }
  ];

  const jobs = await prisma.job.findMany({
    where: { status: currentStatus },
    orderBy,
    skip: (currentPage - 1) * pageSize,
    take: pageSize
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">JobRadar</h1>
            <p className="text-gray-500 mt-1 italic">Discover high-quality remote opportunities</p>
          </div>
          <ProfileEditor />
        </header>

        <SetupGuide 
          hasJobs={totalJobsCount > 0} 
          profileHasSkills={profileHasSkills} 
        />
        
        <JobList 
          initialJobs={jobs} 
          currentStatus={currentStatus} 
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
