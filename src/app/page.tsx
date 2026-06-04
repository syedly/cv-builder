import Link from 'next/link';
import { FileText, Sparkles, Shield, Zap, CheckCircle, ArrowRight, Target, Bot, Download } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Bot, title: 'Multi-Agent AI', desc: 'Job analysis, resume parsing, CV writing, and ATS scoring — each handled by a specialized AI agent.' },
    { icon: Target, title: 'ATS-Optimized', desc: 'Keyword extraction, proper formatting, action verbs — every rule that gets your CV past ATS filters.' },
    { icon: Shield, title: 'BYOK Secure', desc: '3 free tries with our key. Add your own OpenAI key for unlimited, encrypted securely with AES-256.' },
    { icon: Download, title: 'PDF & DOCX', desc: 'Download your tailored CV in both PDF and editable Word format instantly.' },
  ];

  const steps = [
    { n: '1', label: 'Paste job description', desc: 'LinkedIn URL or full text' },
    { n: '2', label: 'Upload your resume', desc: 'PDF, DOCX, or skip for scratch' },
    { n: '3', label: 'Download your CV', desc: 'ATS-scored, keyword-matched' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            AI CV Builder
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Multi-Agent AI · ATS-Optimized · Free to Start
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Land more interviews with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-crafted CVs
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste any job description, upload your resume (or start fresh), and our multi-agent AI
            generates a 100% ATS-optimized CV tailored precisely to the role — in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              <Sparkles className="w-5 h-5" />
              Generate Free CV
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-400">3 free CVs · No credit card required</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500">Three steps to your perfect CV</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.n} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-[80%] h-px bg-blue-200" />
                )}
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4 relative z-10">
                  {step.n}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{step.label}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for job seekers</h2>
            <p className="text-slate-500">Everything you need to pass ATS systems</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Score preview */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Real-time ATS scoring</h2>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Every generated CV comes with a detailed ATS report — keyword match percentage,
                format compliance, missing skills, and specific suggestions to improve your score.
              </p>
              <ul className="space-y-3">
                {['Keyword match analysis', 'Format compliance check', 'Missing keyword alerts', 'Actionable suggestions'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-300 shrink-0" />
                    <span className="text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl font-bold">87</div>
                <div>
                  <div className="font-semibold">ATS Score</div>
                  <div className="text-blue-200 text-xs">Grade B — ATS Ready ✓</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Keyword Match', val: 34, max: 40 },
                  { label: 'Format', val: 30, max: 30 },
                  { label: 'Content Quality', val: 18, max: 20 },
                  { label: 'Structure', val: 5, max: 10 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-100">{item.label}</span>
                      <span className="font-medium">{item.val}/{item.max}</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${(item.val / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Start landing more interviews</h2>
          <p className="text-slate-500 mb-8">Join thousands using AI to craft ATS-ready CVs in seconds</p>
          <Link href="/register" className="btn-primary text-base px-8 py-4 inline-flex">
            <Sparkles className="w-5 h-5" />
            Get 3 Free CVs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-slate-600">AI CV Builder</span>
          </div>
          <p>© {new Date().getFullYear()} AI CV Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
