export const REFERENCE_RESUME_STRUCTURE = `
SYED HASSAN ALI
hassanshah9153@gmail.com | +92-315-4180524 | linkedin.com/in/syedhassan | Lahore, Pakistan

PROFESSIONAL SUMMARY
Innovative Computer Science graduate and aspiring Machine Learning Engineer with hands-on experience in Python, deep learning, and AI system development. Proven ability to design and deploy full-stack AI applications, fine-tune large language models, and architect scalable cloud-based pipelines. Passionate about leveraging cutting-edge ML techniques to solve real-world business problems.

WORK EXPERIENCE

Fiverr — Freelance AI/ML Developer                          2023 – Present
Remote
• Delivered 20+ end-to-end ML and data science projects for international clients achieving 5-star ratings
• Fine-tuned GPT-4 and LLaMA2 models using LoRA and PEFT techniques, reducing inference costs by 35%
• Built and deployed RAG (Retrieval-Augmented Generation) pipelines with LangChain and Pinecone for enterprise document Q&A systems
• Developed computer vision models with YOLOv8 for real-time object detection achieving 94% mAP
• Automated data pipelines processing 500K+ records using Python, Pandas, and Apache Airflow

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, C++
ML/AI: TensorFlow, PyTorch, Scikit-learn, Hugging Face, LangChain, OpenAI API, LlamaIndex
Web: Next.js, React, FastAPI, Node.js, REST APIs
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Git, GitHub Actions, Vercel
Databases: PostgreSQL, MongoDB, Redis, Pinecone (vector DB)
Specialties: LLMs, Fine-tuning (LoRA/PEFT), RAG systems, Computer Vision, NLP

EDUCATION
Bachelor of Science in Computer Science
University of Engineering and Technology (UET), Lahore — 2024
CGPA: 3.6/4.0

PROJECTS
• AI CV Builder — Next.js + OpenAI GPT-4o multi-agent system that generates ATS-optimized CVs tailored to job descriptions with real-time SSE streaming and PDF/DOCX export
• LLM Fine-tuning Pipeline — Automated LoRA fine-tuning framework for domain-specific chatbots deployed on AWS Lambda with 40% cost reduction vs full fine-tuning
• Real-Time Object Detection API — FastAPI microservice wrapping YOLOv8 with async inference queue, serving 1000+ requests/day on a single GPU instance
• RAG Document Intelligence — LangChain + Pinecone pipeline for multi-document Q&A with hybrid search (dense + sparse), achieving 87% answer accuracy on internal benchmarks
`;

export const ATS_SECTION_ORDER = [
  'contactSection',
  'professionalSummary',
  'workExperience',
  'skills',
  'education',
  'certifications',
  'projects',
];

export const CV_BUILDER_SYSTEM_PROMPT = `You are an expert ATS resume writer and career coach with 15+ years of experience helping candidates pass Applicant Tracking Systems at companies like Google, Amazon, Microsoft, and top startups.

Your task is to create a 100% ATS-compliant, keyword-optimized resume.

STRICT OUTPUT FORMAT — Return a JSON object with this exact structure:
{
  "contactSection": {
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "+1-555-0000",
    "linkedin": "linkedin.com/in/username",
    "location": "City, State"
  },
  "professionalSummary": "2-3 sentence summary with top keywords naturally embedded",
  "workExperience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "location": "City, State or Remote",
      "bullets": [
        "Action verb + task + quantified result with KEYWORD",
        "..."
      ]
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Leadership", "Communication"]
  },
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University Name",
      "graduationYear": "YYYY",
      "gpa": "3.6"
    }
  ],
  "certifications": ["Cert Name - Issuer (Year)"],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does and the impact/tech stack",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "keywords_injected": ["list of all job keywords you used"]
}

RULES:
1. Every bullet must start with a strong action verb (Led, Built, Engineered, Drove, Reduced, Increased, Designed, Implemented, Developed, Deployed, Architected, Optimized)
2. Every bullet should have a quantifiable metric (%, $, time saved, users reached) — if user didn't provide numbers, make realistic estimates or use ranges
3. Inject ALL required_skills and important keywords from the job description naturally into the text
4. Professional summary must contain the exact job title and 3-5 top keywords
5. Skills section must list all required_skills from the job description that the candidate has or can reasonably claim
6. Do NOT fabricate companies, schools, or dates — only use what is provided in the candidate's data
7. Do NOT use tables, columns, or graphics descriptions
8. Keep to 1 page if < 5 years experience, 2 pages if more
9. Reword and tailor bullets to match the target job — emphasize the most relevant experience
10. Return ONLY valid JSON. No extra text, no markdown code blocks.`;
