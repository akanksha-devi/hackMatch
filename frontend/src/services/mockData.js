export const INITIAL_HACKATHONS = [
  {
    id: "h1",
    title: "Smart India Hackathon 2026",
    organizer: "Ministry of Education & AICTE",
    mode: "Hybrid",
    location: "New Delhi & Online",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    registrationDeadline: "2026-09-05",
    registrationLink: "https://sih.gov.in",
    tags: ["AI", "Web Dev", "IoT", "GovTech"],
    description: "Nationwide initiative to provide students a platform to solve pressing problems of our daily lives, and thus inculcate a culture of product innovation and a mindset of problem-solving.",
    postedBy: "u1",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "h2",
    title: "EthGlobal Innovate 2026",
    organizer: "ETHGlobal",
    mode: "Online",
    location: "Worldwide",
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    registrationDeadline: "2026-09-25",
    registrationLink: "https://ethglobal.com",
    tags: ["Web3", "Blockchain", "DeFi", "Solidity"],
    description: "Build cutting-edge decentralized applications with world-class mentors and \$100,000+ in bounties across DeFi, Zero-Knowledge proofs, and consumer crypto.",
    postedBy: "u2",
    createdAt: "2026-08-05T14:30:00Z"
  },
  {
    id: "h3",
    title: "Google AI Agents Buildathon",
    organizer: "Google Cloud & DeepMind",
    mode: "Online",
    location: "Global",
    startDate: "2026-09-20",
    endDate: "2026-09-22",
    registrationDeadline: "2026-09-18",
    registrationLink: "https://ai.google.dev",
    tags: ["AI", "LLM", "Python", "Gemini API"],
    description: "Create next-generation autonomous AI agents, multi-agent workflows, and LLM applications using Gemini APIs and Agent SDKs.",
    postedBy: "u3",
    createdAt: "2026-08-10T09:15:00Z"
  },
  {
    id: "h4",
    title: "DesignHacks 2026 (UI/UX & Frontend)",
    organizer: "Figma & DesignNation",
    mode: "Offline",
    location: "Bengaluru Tech Park",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    registrationDeadline: "2026-10-01",
    registrationLink: "https://designhacks.io",
    tags: ["UI/UX", "Figma", "React", "Frontend"],
    description: "A 24-hour design and code sprint where designers and creative developers build pixel-perfect, accessible web experiences.",
    postedBy: "u4",
    createdAt: "2026-08-12T11:00:00Z"
  }
];

export const INITIAL_USERS = [
  {
    id: "u1",
    name: "Alex Rivera",
    email: "alex@example.com",
    password: "password123",
    bio: "Full-Stack Developer passionate about React, Node.js, and cloud systems. 3x hackathon winner.",
    skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "TailwindCSS"],
    experienceLevel: "Advanced",
    githubUrl: "https://github.com/alexrivera",
    linkedinUrl: "https://linkedin.com/in/alexrivera",
    portfolioUrl: "https://alexrivera.dev",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-01-15T08:00:00Z"
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "password123",
    bio: "AI Engineer & Data Scientist. Specialist in PyTorch, LangChain, Gemini API, and computer vision models.",
    skills: ["Python", "PyTorch", "AI", "LLM", "Gemini API", "FastAPI", "TensorFlow"],
    experienceLevel: "Advanced",
    githubUrl: "https://github.com/priyasharma",
    linkedinUrl: "https://linkedin.com/in/priyasharma",
    portfolioUrl: "https://priya.ai",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-02-10T09:30:00Z"
  },
  {
    id: "u3",
    name: "David Chen",
    email: "david@example.com",
    password: "password123",
    bio: "Web3 Engineer & Smart Contract developer. Building decentralized solutions with Solidity and Ethers.js.",
    skills: ["Solidity", "Blockchain", "Web3", "React", "Rust", "Ethers.js"],
    experienceLevel: "Intermediate",
    githubUrl: "https://github.com/davidchen",
    linkedinUrl: "https://linkedin.com/in/davidchen",
    portfolioUrl: "https://davidchen.io",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-03-01T12:00:00Z"
  },
  {
    id: "u4",
    name: "Sophia Martinez",
    email: "sophia@example.com",
    password: "password123",
    bio: "UI/UX Product Designer turning complex problems into intuitive, high-converting digital products.",
    skills: ["UI/UX", "Figma", "Design Systems", "Prototyping", "User Research", "TailwindCSS"],
    experienceLevel: "Intermediate",
    githubUrl: "https://github.com/sophiadesign",
    linkedinUrl: "https://linkedin.com/in/sophiamartinez",
    portfolioUrl: "https://sophiadesign.co",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-03-20T14:15:00Z"
  },
  {
    id: "u5",
    name: "Rohan Patel",
    email: "rohan@example.com",
    password: "password123",
    bio: "Backend enthusiast & DevOps learner. Loves building scalable REST APIs and Microservices.",
    skills: ["Node.js", "Express", "MongoDB", "Docker", "Python", "PostgreSQL"],
    experienceLevel: "Beginner",
    githubUrl: "https://github.com/rohanpatel",
    linkedinUrl: "https://linkedin.com/in/rohanpatel",
    portfolioUrl: "",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: "u6",
    name: "Elena Rostova",
    email: "elena@example.com",
    password: "password123",
    bio: "Frontend Wizard & Animation fanatic. Crafting 60fps web experiences with Three.js & Framer Motion.",
    skills: ["React", "TypeScript", "Three.js", "TailwindCSS", "UI/UX", "Next.js"],
    experienceLevel: "Advanced",
    githubUrl: "https://github.com/elenarostova",
    linkedinUrl: "https://linkedin.com/in/elenarostova",
    portfolioUrl: "https://elena.dev",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-04-18T16:20:00Z"
  }
];

export const INITIAL_TEAM_REQUESTS = [
  {
    id: "tr1",
    hackathonId: "h1",
    postedBy: "u1",
    title: "Looking for PyTorch / AI Specialist for Smart India Hackathon",
    description: "We are building an AI-powered traffic optimization system for Smart India Hackathon. We have the React frontend and Node backend ready, but desperately need an AI engineer who can train a computer vision model on video feeds.",
    skillsNeeded: ["Python", "PyTorch", "AI", "Gemini API"],
    teamSizeNeeded: 2,
    status: "Open",
    createdAt: "2026-08-15T10:00:00Z"
  },
  {
    id: "tr2",
    hackathonId: "h2",
    postedBy: "u3",
    title: "Need UI/UX Designer & Solidity Expert for EthGlobal",
    description: "Building an automated micro-lending protocol on Ethereum L2. Need a smart contract dev to assist with Solidity security and a UI/UX designer to make the dApp consumer-friendly.",
    skillsNeeded: ["Solidity", "UI/UX", "Figma", "Web3"],
    teamSizeNeeded: 2,
    status: "Open",
    createdAt: "2026-08-18T11:30:00Z"
  },
  {
    id: "tr3",
    hackathonId: "h3",
    postedBy: "u2",
    title: "Need React + Tailwind Developer to build agent control dashboard",
    description: "I have created autonomous multi-agent backend Python architecture for Google AI Agents Buildathon. Looking for a talented React dev to build an interactive dashboard displaying agent reasoning steps in real-time.",
    skillsNeeded: ["React", "TypeScript", "TailwindCSS", "Node.js"],
    teamSizeNeeded: 1,
    status: "Open",
    createdAt: "2026-08-20T14:00:00Z"
  }
];

export const INITIAL_RESPONSES = [
  {
    id: "res1",
    teamRequestId: "tr1",
    respondentId: "u2",
    message: "Hey Alex! I saw your post for SIH. I have 2 years of PyTorch experience and recently built an object detection pipeline using OpenCV. Would love to join your team!",
    status: "Pending",
    createdAt: "2026-08-16T09:00:00Z"
  },
  {
    id: "res2",
    teamRequestId: "tr2",
    respondentId: "u4",
    message: "Hi David! I specialize in Web3 UI design and Figma component libraries. Would be thrilled to design the dApp interface for EthGlobal!",
    status: "Accepted",
    createdAt: "2026-08-19T15:30:00Z"
  }
];
