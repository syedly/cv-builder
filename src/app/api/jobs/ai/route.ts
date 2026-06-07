import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import UserProfile from '@/models/UserProfile';
import { decryptAPIKey } from '@/lib/encryption';
import { searchAllJobs, JobSearchParams } from '@/lib/jobAPIs';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;

  const [user, profile] = await Promise.all([
    User.findById(userId).select('byokKeyEncrypted byokKeyIV byokKeyTag'),
    UserProfile.findOne({ userId }).select('fullName desiredTitle technicalSkills softSkills location workExperience education'),
  ]);

  if (!user?.byokKeyEncrypted) {
    return NextResponse.json({ error: 'API key required', code: 'NO_BYOK' }, { status: 402 });
  }

  const apiKey = decryptAPIKey(
    user.byokKeyEncrypted as string,
    user.byokKeyIV as string,
    user.byokKeyTag as string,
  );

  const { prompt } = await req.json();
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  const openai = new OpenAI({ apiKey });

  // Build profile context so AI knows what the user is looking for
  const profileLines: string[] = [];
  if (profile?.fullName) profileLines.push(`Candidate name: ${profile.fullName}`);
  if (profile?.desiredTitle) profileLines.push(`Desired role: ${profile.desiredTitle}`);
  if (profile?.location) profileLines.push(`Location: ${profile.location}`);
  if (profile?.technicalSkills?.length) profileLines.push(`Technical skills: ${profile.technicalSkills.slice(0, 15).join(', ')}`);
  if (profile?.softSkills?.length) profileLines.push(`Soft skills: ${profile.softSkills.slice(0, 8).join(', ')}`);
  if (profile?.workExperience?.length) {
    const latest = profile.workExperience[0];
    if (latest?.title) profileLines.push(`Latest experience: ${latest.title} at ${latest.company}`);
    profileLines.push(`Total positions: ${profile.workExperience.length}`);
  }
  if (profile?.education?.length) {
    const edu = profile.education[0];
    if (edu?.degree) profileLines.push(`Education: ${edu.degree}${edu.field ? ` in ${edu.field}` : ''} from ${edu.school}`);
  }

  const profileContext = profileLines.length > 0
    ? `\n\nUSER PROFILE (use this to inform the search if the prompt is vague):\n${profileLines.join('\n')}`
    : '';

  // Step 1: Extract structured search params from prompt + profile
  const parseResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a job search assistant. Extract job search parameters from the user's prompt.
If the prompt is vague or says "find me jobs" / "search for me", use the user's profile to infer good search terms.
Return ONLY valid JSON with these optional fields:
{ "query": string, "location": string, "types": string[], "workModes": string[], "datePosted": string }
- types: any of ["full-time", "part-time", "contract", "intern"]
- workModes: any of ["remote", "hybrid", "on-site"]
- datePosted: one of "today", "3days", "week", "month"
Omit fields not applicable. No null values.${profileContext}`,
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 250,
    temperature: 0.1,
  });

  let searchParams: JobSearchParams = { query: profile?.desiredTitle || prompt.slice(0, 100) };
  try {
    const parsed = JSON.parse(parseResponse.choices[0].message.content || '{}');
    // If no location in prompt but profile has one, use it as fallback
    if (!parsed.location && profile?.location) parsed.location = profile.location;
    searchParams = { ...searchParams, ...parsed };
  } catch {}

  // Step 2: Fetch jobs with extracted params
  const { jobs, sources } = await searchAllJobs({ ...searchParams, limit: 30, page: 1 });

  // Step 3: AI ranks/curates results using profile context
  let rankedJobs = jobs;
  if (jobs.length > 0) {
    const skillsStr = profile?.technicalSkills?.slice(0, 10).join(', ') || '';
    const jobSummaries = jobs.slice(0, 25).map((j, i) =>
      `${i}: ${j.title} at ${j.company} (${j.location}, ${j.workMode}, ${j.type}) | Tags: ${j.tags.join(',')} | ${j.description.slice(0, 60)}`
    ).join('\n');

    const rankResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a job matching assistant. Rank the provided jobs by relevance to the user's request and profile.
Return ONLY JSON: { "indices": number[] } — sorted from most to least relevant. Include at most 15.`,
        },
        {
          role: 'user',
          content: `User request: "${prompt}"
User skills: ${skillsStr || 'not specified'}
Desired role: ${profile?.desiredTitle || 'not specified'}

Jobs:
${jobSummaries}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.1,
    });

    try {
      const ranked = JSON.parse(rankResponse.choices[0].message.content || '{"indices":[]}');
      const indices: number[] = ranked.indices || ranked.results || ranked.order || [];
      if (indices.length > 0) {
        rankedJobs = indices.map(i => jobs[i]).filter(Boolean);
      }
    } catch {}
  }

  return NextResponse.json({
    jobs: rankedJobs,
    sources,
    extractedParams: searchParams,
    total: rankedJobs.length,
    usedProfile: profileLines.length > 0,
  });
}
