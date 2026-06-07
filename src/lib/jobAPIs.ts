/* Job portal — multi-source API library
   Sources: Adzuna · JSearch (RapidAPI) · Remotive · Arbeitnow
*/

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  type: 'full-time' | 'part-time' | 'contract' | 'intern' | 'other';
  workMode: 'remote' | 'hybrid' | 'on-site' | 'unknown';
  url: string;
  postedAt: string;
  source: 'adzuna' | 'jsearch' | 'remotive' | 'arbeitnow' | 'remoteok';
  sourceName: string;
  tags: string[];
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  types?: string[];       // full-time, part-time, contract, intern
  workModes?: string[];   // remote, hybrid, on-site
  datePosted?: string;    // today, 3days, week, month
  page?: number;
  limit?: number;
}

/* ─── helpers ─────────────────────────────────────────────── */
function detectWorkMode(text: string): Job['workMode'] {
  const t = text.toLowerCase();
  if (t.includes('remote') || t.includes('work from home') || t.includes('wfh')) return 'remote';
  if (t.includes('hybrid')) return 'hybrid';
  if (t.includes('on-site') || t.includes('onsite') || t.includes('in office') || t.includes('in-office')) return 'on-site';
  return 'unknown';
}

function normalizeType(raw: string): Job['type'] {
  const t = (raw || '').toLowerCase();
  if (t.includes('full')) return 'full-time';
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract') || t.includes('freelance') || t.includes('temporary')) return 'contract';
  if (t.includes('intern')) return 'intern';
  return 'other';
}

function safeSlice(text: string, len = 400): string {
  return (text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, len);
}

async function withTimeout<T>(p: Promise<T>, ms = 9000): Promise<T> {
  const timer = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
  return Promise.race([p, timer]);
}

/* ─── Adzuna ──────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAdzuna(raw: any): Job {
  const desc = safeSlice(raw.description || '');
  return {
    id: `adzuna-${raw.id}`,
    title: raw.title || '',
    company: raw.company?.display_name || 'Unknown',
    location: raw.location?.display_name || raw.location?.area?.join(', ') || '',
    description: desc,
    salary: raw.salary_min
      ? `$${Math.round(raw.salary_min / 1000)}k – $${Math.round((raw.salary_max || raw.salary_min) / 1000)}k`
      : undefined,
    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,
    type: raw.contract_time === 'part_time' ? 'part-time' : raw.contract_type === 'contract' ? 'contract' : 'full-time',
    workMode: detectWorkMode(raw.title + ' ' + desc),
    url: raw.redirect_url,
    postedAt: raw.created,
    source: 'adzuna',
    sourceName: 'Adzuna',
    tags: raw.category?.tag ? [raw.category.tag] : [],
  };
}

export async function searchAdzuna(params: JobSearchParams): Promise<Job[]> {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey || appId === 'your_adzuna_app_id') return [];

  const dateMap: Record<string, number> = { today: 1, '3days': 3, week: 7, month: 30 };
  const daysCut = dateMap[params.datePosted || ''] || 30;

  const qs = new URLSearchParams({
    app_id: appId, app_key: appKey,
    results_per_page: String(Math.min(params.limit || 20, 50)),
    what: params.query || 'software engineer',
    where: params.location || '',
    max_days_old: String(daysCut),
    'content-type': 'application/json',
  });

  if (params.workModes?.includes('remote')) qs.set('what_and', 'remote');
  if (params.types?.includes('part-time')) qs.set('part_time', '1');
  if (params.types?.includes('contract')) qs.set('contract', '1');

  const country = params.location?.toLowerCase().includes('uk') ? 'gb' : 'us';
  const res = await withTimeout(fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${qs}`));
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map(normalizeAdzuna);
}

/* ─── JSearch (RapidAPI) ─────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeJSearch(raw: any): Job {
  const desc = safeSlice(raw.job_description || '');
  const locParts = [raw.job_city, raw.job_state, raw.job_country].filter(Boolean);
  return {
    id: `jsearch-${raw.job_id}`,
    title: raw.job_title || '',
    company: raw.employer_name || 'Unknown',
    companyLogo: raw.employer_logo || undefined,
    location: locParts.join(', ') || 'Worldwide',
    description: desc,
    salary: raw.job_min_salary
      ? `$${Math.round(raw.job_min_salary / 1000)}k – $${Math.round((raw.job_max_salary || raw.job_min_salary) / 1000)}k`
      : undefined,
    salaryMin: raw.job_min_salary,
    salaryMax: raw.job_max_salary,
    type: normalizeType(raw.job_employment_type || ''),
    workMode: raw.job_is_remote ? 'remote' : detectWorkMode(raw.job_title + ' ' + desc),
    url: raw.job_apply_link || raw.job_google_link || '#',
    postedAt: raw.job_posted_at_datetime_utc || new Date().toISOString(),
    source: 'jsearch',
    sourceName: 'JSearch',
    tags: (raw.job_required_skills || []).slice(0, 6),
  };
}

export async function searchJSearch(params: JobSearchParams): Promise<Job[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  const dateMap: Record<string, string> = { today: 'today', '3days': '3days', week: 'week', month: 'month' };
  const qs = new URLSearchParams({
    query: [params.query || 'developer', params.location || ''].filter(Boolean).join(' in '),
    page: String(params.page || 1),
    num_pages: '1',
    date_posted: dateMap[params.datePosted || ''] || 'month',
  });
  if (params.workModes?.includes('remote')) qs.set('remote_jobs_only', 'true');
  if (params.types?.length) {
    const typeMap: Record<string, string> = { 'full-time': 'FULLTIME', 'part-time': 'PARTTIME', 'contract': 'CONTRACTOR', 'intern': 'INTERN' };
    const mapped = params.types.map(t => typeMap[t]).filter(Boolean);
    if (mapped.length) qs.set('employment_types', mapped.join(','));
  }

  const res = await withTimeout(fetch(`https://jsearch.p.rapidapi.com/search?${qs}`, {
    headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
  }));
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).slice(0, 20).map(normalizeJSearch);
}

/* ─── Remotive (free, remote-only) ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRemotive(raw: any): Job {
  return {
    id: `remotive-${raw.id}`,
    title: raw.title || '',
    company: raw.company_name || 'Unknown',
    companyLogo: raw.company_logo || undefined,
    location: raw.candidate_required_location || 'Worldwide',
    description: safeSlice(raw.description || ''),
    salary: raw.salary || undefined,
    type: normalizeType(raw.job_type || ''),
    workMode: 'remote',
    url: raw.url,
    postedAt: raw.publication_date,
    source: 'remotive',
    sourceName: 'Remotive',
    tags: (raw.tags || []).slice(0, 6),
  };
}

export async function searchRemotive(params: JobSearchParams): Promise<Job[]> {
  if (params.workModes?.length && !params.workModes.includes('remote')) return [];

  const qs = new URLSearchParams({ limit: '20' });
  if (params.query) qs.set('search', params.query);

  const res = await withTimeout(fetch(`https://remotive.com/api/remote-jobs?${qs}`));
  if (!res.ok) return [];
  const data = await res.json();
  return (data.jobs || []).slice(0, 20).map(normalizeRemotive);
}

/* ─── Arbeitnow (free, mostly EU/remote) ─────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeArbeitnow(raw: any): Job {
  const desc = safeSlice(raw.description || '');
  return {
    id: `arbeitnow-${raw.slug || raw.url}`,
    title: raw.title || '',
    company: raw.company_name || 'Unknown',
    companyLogo: raw.company_logo || undefined,
    location: raw.location || 'Europe',
    description: desc,
    type: raw.job_types?.length ? normalizeType(raw.job_types[0]) : 'full-time',
    workMode: raw.remote ? 'remote' : detectWorkMode(raw.title + ' ' + desc),
    url: raw.url,
    postedAt: new Date((raw.created_at || 0) * 1000).toISOString(),
    source: 'arbeitnow',
    sourceName: 'Arbeitnow',
    tags: (raw.tags || []).slice(0, 6),
  };
}

export async function searchArbeitnow(params: JobSearchParams): Promise<Job[]> {
  if (params.workModes?.length && !params.workModes.includes('remote') && !params.workModes.includes('on-site')) return [];

  const qs = new URLSearchParams({ page: '1' });
  if (params.query) qs.set('q', params.query);
  if (params.location) qs.set('location', params.location);

  const res = await withTimeout(fetch(`https://arbeitnow.com/api/job-board-api?${qs}`));
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).slice(0, 20).map(normalizeArbeitnow);
}

/* ─── RemoteOK (free, remote-only) ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRemoteOK(raw: any): Job {
  const salaryMin = raw.salary_min ? Number(raw.salary_min) : undefined;
  const salaryMax = raw.salary_max ? Number(raw.salary_max) : undefined;
  return {
    id: `remoteok-${raw.id || raw.slug}`,
    title: raw.position || raw.title || '',
    company: raw.company || 'Unknown',
    companyLogo: raw.company_logo || undefined,
    location: raw.location || 'Worldwide',
    description: safeSlice(raw.description || ''),
    salary: salaryMin ? `$${Math.round(salaryMin / 1000)}k – $${Math.round((salaryMax || salaryMin) / 1000)}k` : undefined,
    salaryMin,
    salaryMax,
    type: 'full-time',
    workMode: 'remote',
    url: raw.apply_url || raw.url || '#',
    postedAt: raw.date || new Date().toISOString(),
    source: 'remoteok',
    sourceName: 'RemoteOK',
    tags: (raw.tags || []).slice(0, 6),
  };
}

export async function searchRemoteOK(params: JobSearchParams): Promise<Job[]> {
  // RemoteOK is remote-only; skip if user explicitly filtered on-site/hybrid only
  if (params.workModes?.length && !params.workModes.includes('remote')) return [];

  let url = 'https://remoteok.com/api';
  if (params.query) {
    // RemoteOK accepts comma-separated tags: ?tags=react,node
    const tags = params.query.trim().replace(/\s+/g, ',').toLowerCase();
    url += `?tags=${encodeURIComponent(tags)}`;
  }

  const res = await withTimeout(
    fetch(url, { headers: { 'User-Agent': 'AICVBuilder/1.0 (+https://github.com)' } }),
  );
  if (!res.ok) return [];
  const data = await res.json();
  // First element is a legal/metadata object — skip it
  const jobs: unknown[] = Array.isArray(data) ? data.slice(1) : [];
  return jobs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((j: any) => j && (j.position || j.title))
    .slice(0, 20)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((j: any) => normalizeRemoteOK(j));
}

/* ─── Unified search ─────────────────────────────────────── */
export async function searchAllJobs(params: JobSearchParams): Promise<{ jobs: Job[]; sources: string[]; total: number }> {
  const results = await Promise.allSettled([
    searchJSearch(params).catch(() => [] as Job[]),
    searchAdzuna(params).catch(() => [] as Job[]),
    searchRemotive(params).catch(() => [] as Job[]),
    searchArbeitnow(params).catch(() => [] as Job[]),
    searchRemoteOK(params).catch(() => [] as Job[]),
  ]);

  const allJobs: Job[] = [];
  const activeSources: string[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.length > 0) {
      allJobs.push(...r.value);
      const src = r.value[0]?.sourceName;
      if (src && !activeSources.includes(src)) activeSources.push(src);
    }
  }

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique = allJobs.filter(j => {
    const key = `${j.title.toLowerCase().slice(0, 40)}-${j.company.toLowerCase().slice(0, 20)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Apply client-side filters after aggregation
  let filtered = unique;

  if (params.types?.length) {
    filtered = filtered.filter(j => params.types!.includes(j.type) || j.type === 'other');
  }
  if (params.workModes?.length) {
    filtered = filtered.filter(j => params.workModes!.includes(j.workMode) || j.workMode === 'unknown');
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  const total = filtered.length;
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;

  return { jobs: filtered.slice(offset, offset + limit), sources: activeSources, total };
}
