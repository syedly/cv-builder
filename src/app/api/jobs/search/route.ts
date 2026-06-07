import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchAllJobs, JobSearchParams } from '@/lib/jobAPIs';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: JobSearchParams = await req.json();
  const { jobs, sources, total } = await searchAllJobs(body);

  return NextResponse.json({ jobs, total, sources });
}
