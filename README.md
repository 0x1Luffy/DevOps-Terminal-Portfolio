# 🖥️ Terminal Portfolio — Interactive DevOps Portfolio

> An interactive terminal-based portfolio that lets recruiters explore your skills,
> experience, and projects by typing real shell commands — with a live sandboxed
> Docker environment unlocked via a secret key hidden in your resume.

---

## 📸 Features

| Feature | Details |
|---|---|
| 🟢 **Interactive Terminal** | xterm.js with syntax-colored output, history, autocomplete |
| 📁 **Profile Commands** | `ls`, `cat`, `./experience.sh`, `./projects.sh`, and more |
| 🔐 **Resume Gating** | Secret key in PDF unlocks live SSH sandbox |
| 🐳 **Docker Sandbox** | Isolated container per session, auto-deleted on disconnect |
| 💡 **Recruiter UX** | Click-to-copy command chips for non-technical users |
| 🥚 **Easter Eggs** | Hidden commands like `sudo hire chetan`, `docker ps`, `git log` |
| 🌧️ **Matrix Rain** | Subtle animated background for that hacker aesthetic |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 🗂️ Project Structure

```
terminal-portfolio/
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.js     # Main landing page
│   │   ├── components/
│   │   │   ├── TerminalWindow.js   # xterm.js terminal
│   │   │   ├── HeroSection.js      # Animated hero
│   │   │   ├── MatrixRain.js       # Background effect
│   │   │   ├── QuickHelp.js        # Command reference panel
│   │   │   └── UnlockModal.js      # Resume key validation
│   │   └── styles/
│   │       └── globals.css
│   └── package.json
│
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── index.js                # Entry point
│   │   ├── data/
│   │   │   └── profile.js          # ⭐ EDIT THIS — your info
│   │   ├── commands/
│   │   │   └── processor.js        # Command handler
│   │   ├── docker/
│   │   │   └── containerManager.js # Docker sandbox manager
│   │   ├── socket/
│   │   │   └── terminalSocket.js   # WebSocket handler
│   │   └── routes/
│   │       └── terminal.js         # REST endpoints
│   ├── sandbox-scripts/     # Files inside the Docker sandbox
│   │   ├── experience.sh
│   │   ├── projects.sh
│   │   ├── skills.sh
│   │   ├── education.sh
│   │   ├── deploy.sh        # Simulated CI/CD pipeline
│   │   ├── about.txt
│   │   ├── contact.txt
│   │   └── .bashrc
│   ├── public/
│   │   └── resume.pdf       # ⭐ ADD YOUR RESUME HERE
│   ├── Dockerfile
│   └── Dockerfile.sandbox   # Sandbox container image
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/terminal-portfolio.git
cd terminal-portfolio

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Personalize Your Info

Edit **`server/src/data/profile.js`** — this is where all your content lives:

```js
const SECRET_KEY = "HIRE-CHETAN-2025"; // Change this!

const profile = {
  name: "Chetan",
  title: "DevOps Engineer",
  email: "your@email.com",
  github: "github.com/yourusername",
  linkedin: "linkedin.com/in/yourname",
  location: "Mumbai, India",
};
```

Also update the text in `server/sandbox-scripts/*.sh` files with your real info.

### 3. Add Your Resume

Place your resume PDF at:
```
server/public/resume.pdf
```

Make sure the **SECRET_KEY** from `profile.js` is visible somewhere in the PDF (e.g., in a header, footer, or as a styled callout box).

### 4. Build the Sandbox Docker Image

```bash
cd server
docker build -t chetan-portfolio-sandbox -f Dockerfile.sandbox .
```

### 5. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
cp .env.example .env.local
npm run dev
# Running on http://localhost:3000
```

Open **http://localhost:3000** — you should see the terminal portfolio!

---

## 🐳 Production Deployment (Docker Compose)

```bash
# Build and start everything
docker-compose up -d --build

# Build the sandbox image separately (required)
cd server
docker build -t chetan-portfolio-sandbox -f Dockerfile.sandbox .
```

---

## ☁️ Oracle Cloud VM Deployment

### 1. Provision VM
- Shape: VM.Standard.E2.1.Micro (Always Free) or better
- OS: Ubuntu 22.04
- Open ports: 80, 443, 3000, 5000

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 3. Install Nginx + Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### 4. Deploy
```bash
git clone https://github.com/yourusername/terminal-portfolio.git
cd terminal-portfolio

# Add resume
cp /path/to/your/resume.pdf server/public/resume.pdf

# Build sandbox image
cd server && docker build -t chetan-portfolio-sandbox -f Dockerfile.sandbox . && cd ..

# Update CLIENT_URL in docker-compose.yml to your domain
# Update NEXT_PUBLIC_SERVER_URL in client .env or docker-compose.yml

docker-compose up -d --build

# Install Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🎮 Available Commands

| Command | Description |
|---|---|
| `help` | Show all commands |
| `ls` | List files |
| `cat about.txt` | About me |
| `cat contact.txt` | Contact details |
| `./experience.sh` | Work history |
| `./projects.sh` | Portfolio projects |
| `./skills.sh` | Technical skills |
| `./education.sh` | Education & certs |
| `download resume` | Download resume PDF |
| `unlock` | Enter access key |
| `ssh hire-chetan@ubuntu` | Enter Docker sandbox |
| `clear` | Clear terminal |

### 🥚 Easter Eggs
Try: `whoami`, `sudo hire chetan`, `docker ps`, `kubectl get pods`, `git log --oneline`, `./deploy.sh`, `ping google.com`, `matrix`, `uname -a`

---

## 🔒 Security Model

| Concern | Mitigation |
|---|---|
| No real SSH exposure | Backend proxies via WebSocket + Docker exec |
| Container isolation | `NetworkMode: none`, `CapDrop: ALL`, non-root user |
| Resource limits | 128MB RAM, 50% CPU, 50 PID limit |
| Ephemeral sessions | `AutoRemove: true` — container deleted on disconnect |
| No root access | Container runs as user `chetan` (uid 1001) |
| Rate limiting | Add express-rate-limit in production |

---

## 🛠️ Customization

### Change Secret Key
1. Update `SECRET_KEY` in `server/src/data/profile.js`
2. Add the new key visibly (or stylishly) to your resume PDF
3. Update hint text in `UnlockModal.js` if needed

### Add New Commands
In `server/src/commands/processor.js`, add a case to the switch:
```js
case "cat skills.txt":
  return `your output here`;
```

### Add Easter Eggs
In the `EASTER_EGGS` object in `processor.js`:
```js
"your-secret-command": "Your fun response here",
```

---

## 📦 Tech Stack .

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Terminal UI | xterm.js v5 with FitAddon + WebLinksAddon |
| Backend | Node.js, Express, Socket.IO |
| PTY | node-pty (pseudo-terminal for SSH sessions) |
| Containers | Docker, Dockerode |
| Reverse Proxy | Nginx |
| Deployment | Oracle Cloud VM (or any Linux VPS) |

---

## 📄 License

MIT — fork it, customize it, make it yours!
# DevOps-Terminal-Portfolio
# DevOps-Terminal-Portfolio
# DevOps-Terminal-Portfolio
