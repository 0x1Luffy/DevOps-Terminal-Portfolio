// ============================================================
//  PERSONALIZE THIS FILE WITH YOUR OWN INFORMATION
// ============================================================

const SECRET_KEY = "HIRE-CHETAN-2026"; // Change this - put it in your resume PDF

const profile = {
  name: "Chetan",
  title: "DevOps Engineer",
  email: "chetankesare06@gmail.com",       // Replace with your email
  github: "github.com/0x1luffy",        // Replace with your GitHub
  linkedin: "https://www.linkedin.com/in/chetan-kesare09/", // Replace with your LinkedIn
  location: "Mumbai, India",
};

// ── ls output ───────────────────────────────────────────────
const lsOutput = `
\x1b[1;34mdrwxr-xr-x\x1b[0m  about.txt
\x1b[1;34mdrwxr-xr-x\x1b[0m  experience.sh
\x1b[1;34mdrwxr-xr-x\x1b[0m  projects.sh
\x1b[1;34mdrwxr-xr-x\x1b[0m  skills.sh
\x1b[1;34mdrwxr-xr-x\x1b[0m  education.sh
\x1b[1;34mdrwxr-xr-x\x1b[0m  contact.txt
\x1b[1;33m-rwxr-xr-x\x1b[0m  resume.pdf
`;

// ── about.txt ───────────────────────────────────────────────
const aboutOutput = `
\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m
\x1b[1;36m║           ABOUT ${profile.name.toUpperCase().padEnd(34)}║\x1b[0m
\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m

  \x1b[1;33mName     :\x1b[0m  ${profile.name}
  \x1b[1;33mRole     :\x1b[0m  ${profile.title}
  \x1b[1;33mLocation :\x1b[0m  ${profile.location}

  \x1b[1;37mI'm a passionate DevOps Engineer with 1+ years of
  experience building scalable infrastructure, automating
  CI/CD pipelines, and containerizing applications.\x1b[0m

  I specialize in:
  \x1b[32m•\x1b[0m Cloud-native architecture (AWS / Azure / Oracle Cloud)
  \x1b[32m•\x1b[0m Kubernetes & Docker orchestration
  \x1b[32m•\x1b[0m CI/CD with Jenkins, GitHub Actions & ArgoCD
  \x1b[32m•\x1b[0m Infrastructure as Code (Terraform, Ansible)
  \x1b[32m•\x1b[0m Monitoring with Prometheus & Grafana

  \x1b[90mTip: Run ./experience.sh to see my work history\x1b[0m
`;

// ── experience.sh ────────────────────────────────────────────
const experienceOutput = `
\x1b[1;32m[RUNNING]\x1b[0m experience.sh ...

\x1b[1;36m══════════════════════════════════════════════════\x1b[0m
  \x1b[1;33m💼 WORK EXPERIENCE\x1b[0m
\x1b[1;36m══════════════════════════════════════════════════\x1b[0m

\x1b[1;37m[2025 - Present]  DevOps Engineer\x1b[0m
\x1b[32m                  CloudDrove, Canada\x1b[0m
  • Monitored and maintained AWS ECS services, RDS instances, Redis VMs (OCI), and Kubernetes clusters (OKE/EKS) by
tracking CPU utilization, pod states, and resource health through AWS Console, New Relic, and Splunk, ensuring high
availability.
  • Investigated and resolved infrastructure and application alerts (deployment failures, memory utilization, ELB latency,
Splunk errors, Jenkins pipeline failures) received via Slack, restoring system stability and reducing downtime.
  • Performed system administration tasks including SSH-based health checks, file transfers, and directory
synchronization across environments using Linux commands, rsync, and shell scripting, enabling smooth operations.
  • Collaborated in incident response and reliability improvements by leveraging monitoring dashboards, alerting
policies, and automation scripts, resulting in stable production systems and reduced MTTR.

\x1b[1;37m[2024 - 2024]     SDE Intern\x1b[0m
\x1b[32m                  BlueStock Fintech, Pune\x1b[0m
  • Develop, test, and deploy new features while resolving existing bugs.
  • Participated in daily stand-ups, wrote reusable React components, and ensured mobile responsiveness.
  • Produced and deployed dynamic frontend modules in a fast-paced fintech environment, ensuring platform stability.
  • Worked on React and Node.js, contributing to the development of a high-traffic financial application.

\x1b[90mTip: Run ./projects.sh to see my portfolio projects\x1b[0m
`;

// ── projects.sh ──────────────────────────────────────────────
const projectsOutput = `
\x1b[1;32m[RUNNING]\x1b[0m projects.sh ...

\x1b[1;36m══════════════════════════════════════════════════\x1b[0m
  \x1b[1;33m🚀 FEATURED PROJECTS\x1b[0m
\x1b[1;36m══════════════════════════════════════════════════\x1b[0m

\x1b[1;37m[1] Terminal Portfolio (This App!)\x1b[0m
  \x1b[33mStack:\x1b[0m  MERN + Docker + node-pty + xterm.js
  \x1b[33mAbout:\x1b[0m  Interactive CLI portfolio with sandboxed
           Docker containers for recruiter exploration
  \x1b[33mGitHub:\x1b[0m github.com/chetan/terminal-portfolio

\x1b[1;37m[2] K8s Auto-Scaler\x1b[0m
  \x1b[33mStack:\x1b[0m  Kubernetes + Prometheus + Python
  \x1b[33mAbout:\x1b[0m  Custom HPA controller using business metrics
           Reduced infra cost by 35%
  \x1b[33mGitHub:\x1b[0m github.com/chetan/k8s-autoscaler

\x1b[1;37m[3] GitOps Pipeline Template\x1b[0m
  \x1b[33mStack:\x1b[0m  GitHub Actions + ArgoCD + Helm + Terraform
  \x1b[33mAbout:\x1b[0m  Production-ready GitOps template with
           full observability & security scanning
  \x1b[33mGitHub:\x1b[0m github.com/chetan/gitops-template

\x1b[1;37m[4] Multi-Cloud Cost Dashboard\x1b[0m
  \x1b[33mStack:\x1b[0m  React + Node.js + AWS/GCP APIs + MongoDB
  \x1b[33mAbout:\x1b[0m  Unified dashboard tracking spend across clouds
           with anomaly detection & budget alerts
  \x1b[33mGitHub:\x1b[0m github.com/chetan/cloud-cost-dash

\x1b[90mTip: Run ./skills.sh to see my technical skills\x1b[0m
`;

// ── skills.sh ────────────────────────────────────────────────
const skillsOutput = `
\x1b[1;32m[RUNNING]\x1b[0m skills.sh ...

\x1b[1;36m══════════════════════════════════════════════════\x1b[0m
  \x1b[1;33m⚡ TECHNICAL SKILLS\x1b[0m
\x1b[1;36m══════════════════════════════════════════════════\x1b[0m

\x1b[1;37mCloud Platforms\x1b[0m
  AWS ██████████ Expert    |  GCP ████████░░ Advanced
  Oracle Cloud ███████░░░  |  Azure ██████░░░░ Intermediate

\x1b[1;37mContainerization\x1b[0m
  Docker ██████████        |  Kubernetes ████████░░
  Helm ███████░░░          |  Istio ██████░░░░

\x1b[1;37mCI/CD & GitOps\x1b[0m
  GitHub Actions ████████░░|  Jenkins ████████░░
  ArgoCD ███████░░░        |  GitLab CI ██████░░░░

\x1b[1;37mIaC & Config\x1b[0m
  Terraform ████████░░     |  Ansible ███████░░░
  Pulumi ██████░░░░        |  Chef ████░░░░░░

\x1b[1;37mMonitoring\x1b[0m
  Prometheus ████████░░    |  Grafana ████████░░
  ELK Stack ███████░░░     |  Datadog ██████░░░░

\x1b[1;37mLanguages\x1b[0m
  Bash ████████░░          |  Python ███████░░░
  JavaScript/Node ██████░░ |  Go ████░░░░░░

\x1b[90mTip: Type 'download resume' to get my resume PDF\x1b[0m
`;

// ── education.sh ─────────────────────────────────────────────
const educationOutput = `
\x1b[1;32m[RUNNING]\x1b[0m education.sh ...

\x1b[1;36m══════════════════════════════════════════════════\x1b[0m
  \x1b[1;33m🎓 EDUCATION & CERTIFICATIONS\x1b[0m
\x1b[1;36m══════════════════════════════════════════════════\x1b[0m

\x1b[1;37mB.E. Computer Engineering\x1b[0m
\x1b[32m  University of Mumbai  |  2022 - 2024  |  CGPA: 8.23\x1b[0m

\x1b[1;37m📜 Certifications\x1b[0m

  \x1b[33m[✓]\x1b[0m AWS Certified Cloud Practitioner – Professional

\x1b[1;37m📚 Ongoing Learning\x1b[0m
  • Platform Engineering & Internal Developer Platforms
  • eBPF & Cilium for Kubernetes networking
  • AI/ML Ops & LLM deployment pipelines
`;

// ── contact.txt ──────────────────────────────────────────────
const contactOutput = `
\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m
\x1b[1;36m║              CONTACT ${profile.name.toUpperCase().padEnd(30)}║\x1b[0m
\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m

  \x1b[1;33mEmail    :\x1b[0m  ${profile.email}
  \x1b[1;33mGitHub   :\x1b[0m  ${profile.github}
  \x1b[1;33mLinkedIn :\x1b[0m  ${profile.linkedin}
  \x1b[1;33mLocation :\x1b[0m  ${profile.location}

  \x1b[1;37m✉️  Open to exciting DevOps / Platform Engineering roles!\x1b[0m
  \x1b[90m    Response guaranteed within 24 hours.\x1b[0m
`;

// ── help ─────────────────────────────────────────────────────
const helpOutput = `
\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m
\x1b[1;36m║         AVAILABLE COMMANDS                       ║\x1b[0m
\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m

  \x1b[1;33mBasic Commands\x1b[0m
  \x1b[32mls\x1b[0m                  List available files
  \x1b[32mcat about.txt\x1b[0m       Who am I?
  \x1b[32mcat contact.txt\x1b[0m     How to reach me
  \x1b[32mclear\x1b[0m               Clear the terminal

  \x1b[1;33mProfile Scripts\x1b[0m
  \x1b[32m./experience.sh\x1b[0m     My work history
  \x1b[32m./projects.sh\x1b[0m       Featured projects
  \x1b[32m./skills.sh\x1b[0m         Technical skills
  \x1b[32m./education.sh\x1b[0m      Education & certs

  \x1b[1;33mMore\x1b[0m
  \x1b[32mdownload resume\x1b[0m    Download my resume PDF
  \x1b[32mwhoami\x1b[0m             Who runs this terminal?
  \x1b[32mdocker ps\x1b[0m          Peek at running containers
  \x1b[32mgit log --oneline\x1b[0m  Recent commit history

  \x1b[90m💡 Tip: Use ↑↓ arrow keys to navigate history\x1b[0m
`;

// ── welcome banner ───────────────────────────────────────────
const welcomeBanner = `
\x1b[1;32m ██████╗██╗  ██╗███████╗████████╗ █████╗ ███╗   ██╗\x1b[0m
\x1b[1;32m██╔════╝██║  ██║██╔════╝╚══██╔══╝██╔══██╗████╗  ██║\x1b[0m
\x1b[1;32m██║     ███████║█████╗     ██║   ███████║██╔██╗ ██║\x1b[0m
\x1b[1;32m██║     ██╔══██║██╔══╝     ██║   ██╔══██║██║╚██╗██║\x1b[0m
\x1b[1;32m╚██████╗██║  ██║███████╗   ██║   ██║  ██║██║ ╚████║\x1b[0m
\x1b[1;32m ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝\x1b[0m

\x1b[1;37m  Portfolio Terminal v1.0  |  ${profile.name} — ${profile.title}\x1b[0m
\x1b[90m  Type 'help' to see available commands.\x1b[0m
\x1b[90m  ─────────────────────────────────────────────────\x1b[0m
`;

module.exports = {
  SECRET_KEY,
  profile,
  lsOutput,
  aboutOutput,
  experienceOutput,
  projectsOutput,
  skillsOutput,
  educationOutput,
  contactOutput,
  helpOutput,
  welcomeBanner,
};
