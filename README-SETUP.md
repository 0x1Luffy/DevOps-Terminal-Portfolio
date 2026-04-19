# Complete Setup Guide
# Terminal Portfolio — Local Dev + OCI K3s Deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UNDERSTAND THE ARCHITECTURE FIRST (read this, 3 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What runs on your OCI VM and what each piece does:

  BROWSER
    Opens https://chetancodes.dpdns.org
        │
        │ HTTPS
        ▼
  YOUR OCI VM (Ubuntu, 1 OCPU, 1GB RAM, Always Free)
  ┌────────────────────────────────────────────────────┐
  │                                                    │
  │  K3s (lightweight Kubernetes)                      │
  │  ├── Traefik Ingress (port 80/443)                 │
  │  │     /           → portfolio-client (Next.js)    │
  │  │     /api/*      → portfolio-server (Express)    │
  │  │     /socket.io  → portfolio-server (WebSocket)  │
  │  │                                                 │
  │  ├── portfolio-client  (Next.js, port 3000)        │
  │  │     Serves the landing page + xterm.js UI       │
  │  │                                                 │
  │  ├── portfolio-server  (Node.js, port 5000)        │
  │  │     Handles terminal commands                   │
  │  │     Spawns sandbox containers via Docker API    │
  │  │                                                 │
  │  └── cert-manager                                  │
  │        Auto-gets TLS cert from Let's Encrypt       │
  │                                                    │
  │  Docker Daemon (outside K3s, on the host)          │
  │  └── sandbox container (per user session)          │
  │        Alpine Linux + bash + your scripts          │
  │        64MB RAM, no network, non-root, auto-delete │
  │                                                    │
  └────────────────────────────────────────────────────┘

WHAT EACH PIECE MEANS:
──────────────────────

K3s
  Kubernetes but tiny. Uses ~150MB RAM vs 500MB for full K8s.
  It is the "manager" for your containers. It starts them,
  restarts them if they crash, and handles their networking.

Traefik (comes built into K3s)
  The front door of your VM. Listens on port 80 and 443.
  Reads your Ingress rules and routes each URL path to the
  right container. Handles HTTPS/TLS decryption.

cert-manager
  Gets a free TLS certificate from Let's Encrypt for your domain.
  Renews it automatically every 60 days.
  Without it, browsers show "Not Secure" on your site.

portfolio-client (Next.js container)
  The visual part. Serves the landing page, hero section,
  and the xterm.js terminal UI to the browser.

portfolio-server (Node.js container)
  The brain. Receives commands from the browser terminal
  over WebSocket. For commands like ls and ./experience.sh,
  it processes them and sends back colored text.
  For "ssh hire-chetan@ubuntu", it calls the Docker daemon
  to spawn a real isolated sandbox container.

Docker Daemon
  Runs on the host VM alongside K3s. The server Pod talks to
  it via a mounted socket file (/var/run/docker.sock).
  It creates and destroys sandbox containers on demand.

Sandbox Container (chetan-sandbox:latest)
  A tiny locked-down Alpine Linux container, one per visitor.
  Contains only bash and your portfolio scripts.
  Completely isolated: no network, no root, 64MB RAM.
  Auto-deleted the moment the user's browser tab closes.

ConfigMap
  A Kubernetes object that holds environment variables like
  your domain URL. Injected into containers at startup.

Secret
  Like ConfigMap but for sensitive data (your resume PDF).
  Stored encrypted in K3s. Mounted as a file into the pod.

ResourceQuota + LimitRange
  Hard caps on CPU and RAM for the entire portfolio namespace.
  Prevents sandbox containers from ever using too much of your
  free-tier VM's resources.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 1 — LOCAL SETUP  (start here, on your laptop)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU NEED:
  Node.js 18+      https://nodejs.org  (click LTS)
  Docker Desktop   https://docker.com/products/docker-desktop
  Git              https://git-scm.com

STEP 1 — Put your info in
  Open: server/src/data/profile.js
  Edit: name, title, email, github, linkedin, location

  Open: server/sandbox-scripts/
  Edit: experience.sh, projects.sh, skills.sh, education.sh
        with your real work history

STEP 2 — Add your resume
  cp /path/to/your-resume.pdf server/public/resume.pdf

STEP 3 — Run the backend
  cd server
  npm install
  npm run dev
  # You see: Server running on port 5000

STEP 4 — Run the frontend
  cd client
  npm install
  echo "NEXT_PUBLIC_SERVER_URL=http://localhost:5000" > .env.local
  npm run dev
  # You see: ready on http://localhost:3000

STEP 5 — Test in browser
  Open http://localhost:3000
  Try: help, ls, cat about.txt, ./experience.sh, ./projects.sh

STEP 6 (optional) — Test the sandbox locally
  Docker Desktop must be running.
  cd sandbox
  docker build -t chetan-sandbox:latest .
  # Restart the server, then type: ssh hire-chetan@ubuntu
  # You drop into a real bash inside the sandbox container
  # Type: exit  to leave


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 2 — PREPARE YOUR OCI VM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — Open firewall ports

  OCI has two firewall layers. You must open both.

  Layer 1 — OCI Security List (in OCI web console):
    Networking → VCN → Security Lists → Default Security List
    Add Ingress Rules:
      Source 0.0.0.0/0  TCP  Port 80    (HTTP)
      Source 0.0.0.0/0  TCP  Port 443   (HTTPS)

  Layer 2 — Ubuntu firewall (on your VM):
    ssh ubuntu@YOUR_VM_IP
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 6443/tcp
    sudo ufw reload
    sudo ufw status

STEP 2 — Point your domain to the VM

  Find your VM's public IP in OCI Console → Compute → Instances.

  In your DNS provider for chetancodes.dpdns.org:
    Add: A record  →  @  →  YOUR_VM_PUBLIC_IP  →  TTL 300

  Test from your laptop (wait 5 minutes after adding):
    ping chetancodes.dpdns.org
    # Must show your VM's IP

STEP 3 — Install Docker on the VM

  ssh ubuntu@YOUR_VM_IP
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker ubuntu
  # IMPORTANT: log out and back in after this
  exit
  ssh ubuntu@YOUR_VM_IP
  docker run hello-world
  # Must print: Hello from Docker!

STEP 4 — Verify K3s is working

  sudo k3s kubectl get nodes
  # Shows: your-node   Ready   ...

  sudo k3s kubectl get pods -n kube-system
  # Traefik, CoreDNS should all be Running

STEP 5 — Install cert-manager

  sudo k3s kubectl apply -f \
    https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

  # Wait 60 seconds then check:
  sudo k3s kubectl get pods -n cert-manager
  # All 3 pods must be Running before continuing

STEP 6 — Build the sandbox image on the VM

  This is critical. The sandbox image must exist on the VM's Docker.
  When the server Pod calls Docker to spawn a sandbox, Docker
  looks for the image locally on that host.

  # From your laptop, copy the sandbox directory to the VM:
  scp -r sandbox/ ubuntu@YOUR_VM_IP:~/sandbox/

  # On the VM, build the image:
  ssh ubuntu@YOUR_VM_IP
  cd ~/sandbox
  docker build -t chetan-sandbox:latest .
  docker images | grep chetan-sandbox
  # Must show an image

  # Test it manually:
  docker run --rm -it --network none --memory 64m \
    --user 2000 chetan-sandbox:latest
  # You see the sandbox welcome banner
  # Type ./experience.sh, then exit


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 3 — BUILD AND PUSH YOUR DOCKER IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We use GitHub Container Registry (GHCR) — completely free.

STEP 1 — Create a GitHub Personal Access Token

  github.com → Settings → Developer Settings
  → Personal access tokens → Tokens (classic) → Generate new token

  Name: portfolio-deploy
  Select: write:packages, read:packages, delete:packages
  Generate → COPY THE TOKEN (you only see it once!)

STEP 2 — Log in to GHCR on your laptop

  echo YOUR_TOKEN | docker login ghcr.io \
    -u YOUR_GITHUB_USERNAME --password-stdin
  # Prints: Login Succeeded

STEP 3 — Build and push the server image

  cd server
  docker build -t ghcr.io/YOUR_GITHUB_USERNAME/portfolio-server:latest .
  docker push ghcr.io/YOUR_GITHUB_USERNAME/portfolio-server:latest
  cd ..

STEP 4 — Build and push the client image

  cd client
  docker build \
    --build-arg NEXT_PUBLIC_SERVER_URL=https://chetancodes.dpdns.org \
    -t ghcr.io/YOUR_GITHUB_USERNAME/portfolio-client:latest .
  docker push ghcr.io/YOUR_GITHUB_USERNAME/portfolio-client:latest
  cd ..

STEP 5 — Make the images public

  On github.com, go to your profile → Packages.
  For each package (portfolio-server, portfolio-client):
    Click the package → Package Settings → Change visibility → Public

  This lets your VM pull the images without credentials.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 4 — DEPLOY TO K3S
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — Edit the manifests (3 files, 1 line each)

  k8s/02-server-deployment.yaml
    Change: ghcr.io/YOUR_GITHUB_USERNAME/portfolio-server:latest
    To:     ghcr.io/your-actual-username/portfolio-server:latest

  k8s/03-client-deployment.yaml
    Change: ghcr.io/YOUR_GITHUB_USERNAME/portfolio-client:latest
    To:     ghcr.io/your-actual-username/portfolio-client:latest

  k8s/05-cert-issuer.yaml
    Change: your-email@example.com
    To:     your real email address

STEP 2 — Copy manifests to the VM

  scp -r k8s/ ubuntu@YOUR_VM_IP:~/portfolio-k8s/

STEP 3 — Apply everything

  ssh ubuntu@YOUR_VM_IP
  cd ~/portfolio-k8s

  sudo k3s kubectl apply -f 00-namespace.yaml
  sudo k3s kubectl apply -f 01-configmap.yaml
  sudo k3s kubectl apply -f 05-cert-issuer.yaml
  sudo k3s kubectl apply -f 06-sandbox-rbac.yaml
  sudo k3s kubectl apply -f 02-server-deployment.yaml
  sudo k3s kubectl apply -f 03-client-deployment.yaml
  sudo k3s kubectl apply -f 04-ingress.yaml

STEP 4 — Add resume as a Secret

  # From your laptop:
  scp server/public/resume.pdf ubuntu@YOUR_VM_IP:~/resume.pdf

  # On the VM:
  sudo k3s kubectl create secret generic resume-pdf \
    --from-file=resume.pdf=~/resume.pdf \
    --namespace=portfolio
  rm ~/resume.pdf

STEP 5 — Watch it start

  # Watch pods (Ctrl+C when both show Running)
  sudo k3s kubectl get pods -n portfolio -w

  # Watch certificate (wait for READY=True, takes ~2 minutes)
  sudo k3s kubectl get certificate -n portfolio -w

STEP 6 — Open your site

  https://chetancodes.dpdns.org

  If "Not Secure" shows briefly, wait 2-3 minutes for
  Let's Encrypt to issue the certificate, then refresh.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 5 — THE SANDBOX SECURITY LAYERS (what protects your VM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every protection layer, in plain English:

1. No direct SSH exposure
   Visitors connect via WebSocket in their browser only.
   Port 22 (SSH) is never opened to the public.
   The Node.js server is the only thing that touches Docker.

2. Non-root user inside the container
   The bash session runs as uid 2000 ("chetan").
   Cannot modify system files, read /etc/shadow, or install packages.

3. Zero network inside the sandbox
   NetworkMode: none means the container has no network interface.
   Cannot reach your VM's internal services, K8s API, or the internet.
   Cannot exfiltrate data or scan for other services.

4. Read-only root filesystem
   The entire container filesystem is mounted read-only.
   Only /tmp is writable, max 8MB, with noexec flag.
   Cannot write scripts, cannot modify binaries.

5. All Linux capabilities dropped
   Capabilities are what allow privileged operations in Linux.
   We drop every single one (CapDrop ALL).
   Cannot load kernel modules, change file ownership, bind low ports.

6. No new privileges security option
   Prevents escalation via setuid or setgid binary tricks.
   Even if sudo or su were present, they couldn't work.

7. Hard resource limits
   64MB RAM — cannot cause out-of-memory on your VM.
   10% of one CPU core — cannot slow your site.
   20 process limit — prevents fork bomb attacks.

8. Auto-delete on disconnect
   AutoRemove: true in Docker.
   Container is destroyed immediately when the user disconnects.
   No persistent files, no leftover processes, no foothold.

9. 10-minute session timeout
   Even idle open browser tabs get their container killed at 10 min.

10. Max 5 concurrent sandboxes
    Hard limit in the Node.js server code.
    Prevents someone from spawning hundreds of containers.

11. K8s namespace ResourceQuota
    Even if the server code had a bug, the K8s quota prevents
    more resources from being consumed than defined.

WORST CASE: someone finds a bash escape in Alpine.
They are in a container with: no network, no writable fs,
64MB RAM, 20 max processes, no capabilities, dies in 10 min.
They cannot reach your VM, K8s, or other containers.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PART 6 — UPDATING YOUR SITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When you change profile info, scripts, or code:

  # Rebuild and push (laptop)
  docker build -t ghcr.io/YOUR_USERNAME/portfolio-server:latest ./server
  docker push ghcr.io/YOUR_USERNAME/portfolio-server:latest

  # Restart the pod to pull the new image (VM)
  sudo k3s kubectl rollout restart deployment/portfolio-server -n portfolio
  sudo k3s kubectl rollout status  deployment/portfolio-server -n portfolio

  # For frontend changes — rebuild with domain as build arg
  docker build \
    --build-arg NEXT_PUBLIC_SERVER_URL=https://chetancodes.dpdns.org \
    -t ghcr.io/YOUR_USERNAME/portfolio-client:latest ./client
  docker push ghcr.io/YOUR_USERNAME/portfolio-client:latest
  sudo k3s kubectl rollout restart deployment/portfolio-client -n portfolio


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Site not loading:
  sudo k3s kubectl get pods -n portfolio
  sudo k3s kubectl describe pod -n portfolio -l app=portfolio-client

ImagePullBackOff error (pod stuck):
  Image name is wrong or package is private.
  Check: did you make the GHCR packages public?
  Check: is the image name in the deployment.yaml exactly right?

Terminal shows "Connecting..." forever:
  WebSocket is not reaching the server.
  sudo k3s kubectl logs -n portfolio deployment/portfolio-server
  sudo k3s kubectl get ingress -n portfolio -o yaml

TLS certificate not issuing (site shows "Not Secure"):
  sudo k3s kubectl describe certificate portfolio-tls -n portfolio
  Most common cause: port 80 blocked in OCI Security List.

Sandbox shows "Sandbox unavailable":
  Docker daemon not running or image not built.
  ssh ubuntu@YOUR_VM_IP
  sudo systemctl status docker
  docker images | grep chetan-sandbox

Pod keeps restarting (CrashLoopBackOff):
  sudo k3s kubectl logs -n portfolio deployment/portfolio-server --previous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COMMAND CHEATSHEET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  sudo k3s kubectl get all -n portfolio           # everything
  sudo k3s kubectl get pods -n portfolio -w       # watch pods live
  sudo k3s kubectl logs -n portfolio deployment/portfolio-server -f
  sudo k3s kubectl logs -n portfolio deployment/portfolio-client -f
  sudo k3s kubectl get certificate -n portfolio   # TLS status
  sudo k3s kubectl top pods -n portfolio          # CPU/RAM usage
  sudo k3s kubectl delete namespace portfolio     # nuke and redo
  docker ps | grep portfolio-session              # active sandboxes
  free -h                                         # VM RAM available
