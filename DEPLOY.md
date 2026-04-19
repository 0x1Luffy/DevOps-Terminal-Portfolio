# HOW TO DEPLOY YOUR TERMINAL PORTFOLIO
# Complete step-by-step from zero to live at https://chetancodes.dpdns.org
#
# TIME NEEDED: About 1-2 hours on your first time
# ASSUMED KNOWLEDGE: None. Every command is explained.
# ═══════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE YOU START — WHAT YOU ARE BUILDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Think of it like this. You have an OCI server sitting in a data centre
somewhere. Right now it is just a computer running Ubuntu Linux.
By the end of this guide, when someone types your domain into their
browser, this is what happens:

  1. Their browser connects to your OCI VM on port 443 (HTTPS)
  2. A program called Traefik (already on your VM via K3s) receives it
  3. Traefik looks at the URL and decides:
       - If it's the homepage → send it to your Next.js container (frontend)
       - If it's /api/ or /socket.io/ → send it to your Node.js container (backend)
  4. The visitor sees your terminal portfolio
  5. When they type "ssh hire-chetan@ubuntu" in the terminal:
       - The backend spawns a tiny isolated Docker container just for them
       - Their keystrokes go into that container's bash shell
       - When they close the tab, the container is deleted

You have THREE containers running:
  - portfolio-client   (the website they see)
  - portfolio-server   (the backend that processes commands)
  - per-visitor sandbox containers (spawned on demand, auto-deleted)

And THREE infrastructure pieces:
  - K3s    (manages your containers — already on your VM)
  - Docker (runs the sandbox containers — we will install this)
  - cert-manager (gets you a free HTTPS certificate — we will install this)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — SET UP YOUR LAPTOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You need three programs on your laptop.
Install them if you don't have them already.

─ Node.js ────────────────────────────────────────────────────
  What it is: Runs JavaScript outside of a browser.
              Your backend server is written in JavaScript.
  How to install:
    Go to https://nodejs.org
    Click the big "LTS" button and run the installer
  Check it worked:
    Open a terminal (Command Prompt on Windows, Terminal on Mac)
    Type:  node --version
    You should see something like:  v20.11.0

─ Docker Desktop ─────────────────────────────────────────────
  What it is: Lets you build and run containers on your laptop.
              You need it to build the images you will deploy.
  How to install:
    Go to https://docker.com/products/docker-desktop
    Download for your OS and run the installer
    Start Docker Desktop and wait for it to show "Running"
  Check it worked:
    Type:  docker --version
    You should see something like:  Docker version 25.0.0

─ Git ────────────────────────────────────────────────────────
  What it is: Version control. You need it to push code.
  How to install:
    Go to https://git-scm.com
    Download and install for your OS
  Check it worked:
    Type:  git --version
    You should see something like:  git version 2.43.0


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — PERSONALISE YOUR PORTFOLIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the only part where you add YOUR information.
Open the project folder on your laptop.

─ Step 1: Edit your profile ─────────────────────────────────

Open the file:  server/src/data/profile.js

Find these lines near the top and change them:

  const profile = {
    name:     "Chetan",               ← your name
    title:    "DevOps Engineer",       ← your job title
    email:    "chetan@example.com",    ← your email
    github:   "github.com/chetan",     ← your GitHub URL
    linkedin: "linkedin.com/in/chetan",← your LinkedIn URL
    location: "Mumbai, India",         ← your city
  };

Also find this line and change the secret key to anything you like:
  const SECRET_KEY = "HIRE-CHETAN-2025";
  ← This is what recruiters enter to unlock SSH sandbox (or remove this feature)

─ Step 2: Edit your work history ────────────────────────────

Open these files and replace the example content with your real info:
  sandbox/scripts/experience.sh
  sandbox/scripts/projects.sh
  sandbox/scripts/skills.sh
  sandbox/scripts/education.sh
  sandbox/scripts/about.txt
  sandbox/scripts/contact.txt

─ Step 3: Add your resume ────────────────────────────────────

Copy your resume PDF to:   server/public/resume.pdf

If you don't have a PDF resume yet, create a placeholder:
  On Mac/Linux:  touch server/public/resume.pdf
  On Windows:    Create an empty file called resume.pdf in that folder


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — GITHUB SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You need a GitHub account to store your Docker images.
GitHub gives you free private image storage.

─ Step 1: Create a GitHub account ───────────────────────────

  If you don't have one: go to https://github.com and sign up
  Your username will be used in image names — pick something clean
  Example: if your username is "chetanK" then images will be
           ghcr.io/chetank/portfolio-server:latest

─ Step 2: Create a Personal Access Token ────────────────────

  A token is like a password that lets your laptop push images to GitHub.

  1. Go to github.com, click your profile photo (top right)
  2. Click "Settings"
  3. Scroll down the left sidebar, click "Developer settings"
  4. Click "Personal access tokens"
  5. Click "Tokens (classic)"
  6. Click "Generate new token (classic)"
  7. In the "Note" field type:  portfolio-deploy
  8. Set expiration to "No expiration" (or 1 year)
  9. Tick these checkboxes:
       ✅  write:packages
       ✅  read:packages
       ✅  delete:packages
  10. Click "Generate token" at the bottom
  11. COPY THE TOKEN NOW — you will never see it again
      It looks like:  ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

  Save it somewhere safe. A notes app, password manager, anything.

─ Step 3: Log in to GitHub's image registry ─────────────────

  Open a terminal on your laptop and run this command.
  Replace YOUR_TOKEN with the token you just copied.
  Replace YOUR_USERNAME with your GitHub username.

    echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

  You should see:  Login Succeeded

  Example (with fake values):
    echo ghp_abc123xyz | docker login ghcr.io -u chetanK --password-stdin

─ Step 4: Create a GitHub repository ────────────────────────

  1. Go to github.com
  2. Click the "+" icon (top right) → "New repository"
  3. Name it:  terminal-portfolio
  4. Set it to Public
  5. Click "Create repository"
  6. GitHub will show you commands — ignore them for now

  Now push your code:
    Open a terminal in your project folder (where this file is)

    git init
    git add .
    git commit -m "Initial portfolio"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/terminal-portfolio.git
    git push -u origin main

  When asked for username: your GitHub username
  When asked for password: your token (not your account password)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — BUILD AND PUSH DOCKER IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A Docker "image" is like a blueprint for a container.
You build it once on your laptop, push it to GitHub,
then your OCI VM pulls and runs it.

Replace YOUR_USERNAME with your GitHub username in every command below.

─ Build and push the backend (server) image ─────────────────

  In a terminal, navigate to the project folder, then:

    cd server
    docker build -t ghcr.io/YOUR_USERNAME/portfolio-server:latest .
    docker push ghcr.io/YOUR_USERNAME/portfolio-server:latest
    cd ..

  What these commands do:
    docker build  →  reads the Dockerfile and builds the image
    -t            →  names/tags the image
    .             →  use the current folder as context
    docker push   →  uploads the image to GitHub

  This takes 2-5 minutes the first time.

─ Build and push the frontend (client) image ────────────────

  IMPORTANT: the --build-arg line bakes your domain into the
  JavaScript bundle at build time. This is required.

    cd client
    docker build \
      --build-arg NEXT_PUBLIC_SERVER_URL=https://chetancodes.dpdns.org \
      -t ghcr.io/YOUR_USERNAME/portfolio-client:latest .
    docker push ghcr.io/YOUR_USERNAME/portfolio-client:latest
    cd ..

  This takes 5-10 minutes the first time.

─ Make the images public ────────────────────────────────────

  By default GitHub images are private.
  Your OCI VM needs to pull them — make them public.

  For each image (do this twice, once for server, once for client):
    1. Go to github.com/YOUR_USERNAME
    2. Click "Packages" tab
    3. Click on the package name (e.g. portfolio-server)
    4. On the right side, click "Package settings"
    5. Scroll to "Danger Zone"
    6. Click "Change visibility" → Public → type the package name → confirm


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — PREPARE YOUR OCI VM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

─ Step 1: Find your VM's public IP address ──────────────────

  1. Log in to https://cloud.oracle.com
  2. Click the hamburger menu (≡) top left
  3. Compute → Instances
  4. Click on your instance
  5. Look for "Public IP address" — copy it
     It looks like:  140.238.xxx.xxx

─ Step 2: Open firewall ports in OCI ────────────────────────

  OCI has a firewall that blocks everything by default.
  You need to open ports 80 (HTTP) and 443 (HTTPS).

  1. In OCI Console, go to: Networking → Virtual Cloud Networks
  2. Click on your VCN (virtual cloud network)
  3. Click "Security Lists" in the left panel
  4. Click "Default Security List"
  5. Click "Add Ingress Rules"
  6. Add this rule:
       Source CIDR:    0.0.0.0/0
       IP Protocol:    TCP
       Destination Port Range:  80
       Description:   HTTP
     Click "Add Ingress Rules"
  7. Repeat for port 443:
       Source CIDR:    0.0.0.0/0
       IP Protocol:    TCP
       Destination Port Range:  443
       Description:   HTTPS
     Click "Add Ingress Rules"

─ Step 3: SSH into your VM ──────────────────────────────────

  From your laptop terminal:

    ssh ubuntu@YOUR_VM_IP

  Example:   ssh ubuntu@140.238.123.45

  If you get a "permission denied" error, you need to use your SSH key:
    ssh -i /path/to/your-key.pem ubuntu@YOUR_VM_IP

  Type "yes" if asked about fingerprint.
  You should see a prompt like:   ubuntu@your-hostname:~$

  You are now "inside" your OCI VM.
  All commands from here until "Exit the VM" run ON THE VM, not your laptop.

─ Step 4: Open Ubuntu's firewall ────────────────────────────

  Ubuntu has its own firewall (ufw) in addition to OCI's.
  Run these commands on your VM:

    sudo ufw allow 22/tcp       # SSH — keep this open or you'll lock yourself out!
    sudo ufw allow 80/tcp       # HTTP
    sudo ufw allow 443/tcp      # HTTPS
    sudo ufw --force enable     # turn on the firewall
    sudo ufw status             # check it

  You should see:
    22/tcp    ALLOW
    80/tcp    ALLOW
    443/tcp   ALLOW

─ Step 5: Install Docker on the VM ──────────────────────────

  K3s (already on your VM) manages your app containers.
  But we also need Docker to run the sandbox feature.
  They run side by side — no conflict.

    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker ubuntu

  The second command lets you run docker without sudo.
  For it to take effect, you must log out and log back in:

    exit
    ssh ubuntu@YOUR_VM_IP

  Now check Docker works:

    docker run hello-world

  You should see:   Hello from Docker!
  If you see it, Docker is working correctly.

─ Step 6: Verify K3s is running ─────────────────────────────

    sudo k3s kubectl get nodes

  You should see one line like:
    NAME         STATUS   ROLES    AGE   VERSION
    your-node    Ready    master   Xd    v1.28.x

  If you see Ready — K3s is working. Good.

    sudo k3s kubectl get pods -n kube-system

  You should see several pods. Look for "traefik" — it should say Running.
  Traefik is the built-in web router that handles your HTTPS traffic.

─ Step 7: Set up your domain DNS ────────────────────────────

  You need to point chetancodes.dpdns.org to your VM's IP.

  Where you manage chetancodes.dpdns.org DNS:
    (This depends on your domain registrar. Common ones: Cloudflare,
     GoDaddy, Namecheap, or DuckDNS if it's a free dpdns.org subdomain)

  For DuckDNS (if that's what dpdns.org is):
    1. Go to https://www.duckdns.org
    2. Log in
    3. Find your domain
    4. Update the IP to your OCI VM's public IP
    5. Click "Update IP"

  For any other DNS provider, add:
    Type:   A
    Name:   @ (or leave blank, means root domain)
    Value:  YOUR_VM_PUBLIC_IP
    TTL:    300 (or lowest option)

  Test it (from your LAPTOP, not the VM):
    Wait 5 minutes then run:
    ping chetancodes.dpdns.org

  You should see your VM's IP in the response.
  If you see a different IP or "not found", DNS hasn't updated yet — wait more.

─ Step 8: Install cert-manager ──────────────────────────────

  cert-manager gets you a free HTTPS certificate from Let's Encrypt.
  Without it, browsers show "Not Secure" on your site.

  Run on your VM:

    sudo k3s kubectl apply -f \
      https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

  This downloads and installs cert-manager into K3s.
  Wait about 60 seconds, then check it worked:

    sudo k3s kubectl get pods -n cert-manager

  You should see 3 pods, all showing "Running":
    cert-manager-xxx              1/1   Running
    cert-manager-cainjector-xxx   1/1   Running
    cert-manager-webhook-xxx      1/1   Running

  If some show "ContainerCreating" — wait another 30 seconds and check again.
  Do NOT continue until all 3 show Running.

─ Step 9: Build the sandbox image on the VM ─────────────────

  The sandbox Docker image must exist on the VM's own Docker.
  (When your server spawns a sandbox, it asks Docker: "give me a container
  from image chetan-sandbox:latest" — Docker looks on the LOCAL machine.)

  First, copy your sandbox folder from your LAPTOP to the VM.
  Open a NEW terminal on your laptop (keep the VM terminal open too):

    scp -r sandbox/ ubuntu@YOUR_VM_IP:~/sandbox/

  Now go back to your VM terminal and build the image:

    cd ~/sandbox
    docker build -t chetan-sandbox:latest .
    cd ~

  Check it built:
    docker images

  You should see a line with:   chetan-sandbox   latest   ...

  Test the sandbox manually (optional but good to do):
    docker run --rm -it --network none --memory 64m --user 2000 chetan-sandbox:latest
    # You should see the welcome banner
    # Try:  ls
    # Try:  ./experience.sh
    # Type: exit  to leave


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — UPDATE THE K8S MANIFEST FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Back on YOUR LAPTOP now.

Open these files and make the changes shown.

─ File 1: k8s/02-server-deployment.yaml ─────────────────────

  Find this line:
    image: ghcr.io/YOUR_GITHUB_USERNAME/portfolio-server:latest

  Change YOUR_GITHUB_USERNAME to your actual GitHub username.
  Example:
    image: ghcr.io/chetanK/portfolio-server:latest

─ File 2: k8s/03-client-deployment.yaml ─────────────────────

  Find this line:
    image: ghcr.io/YOUR_GITHUB_USERNAME/portfolio-client:latest

  Change YOUR_GITHUB_USERNAME to your actual GitHub username.

─ File 3: k8s/05-cert-issuer.yaml ───────────────────────────

  Find this line (appears twice):
    email: your-email@example.com

  Change both to your real email address.
  Let's Encrypt uses this to email you if your certificate is about to expire.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — DEPLOY TO K3S
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now you send everything to your VM and apply it.

─ Step 1: Copy manifest files to your VM ────────────────────

  From your LAPTOP terminal:

    scp -r k8s/ ubuntu@YOUR_VM_IP:~/portfolio-k8s/

─ Step 2: Copy resume to VM ─────────────────────────────────

    scp server/public/resume.pdf ubuntu@YOUR_VM_IP:~/resume.pdf

─ Step 3: SSH into your VM ──────────────────────────────────

    ssh ubuntu@YOUR_VM_IP

─ Step 4: Apply every manifest file ─────────────────────────

  Run each of these commands one at a time.
  Wait for each to say "created" or "configured" before the next.

    cd ~/portfolio-k8s

    # Creates the "portfolio" namespace
    # A namespace is like a folder that groups related K8s resources
    sudo k3s kubectl apply -f 00-namespace.yaml

    # Stores your environment variables (domain URL etc.)
    sudo k3s kubectl apply -f 01-configmap.yaml

    # Tells cert-manager how to get TLS certificates
    sudo k3s kubectl apply -f 05-cert-issuer.yaml

    # Sets memory/CPU limits to protect your free-tier VM
    sudo k3s kubectl apply -f 06-sandbox-rbac.yaml

    # Deploys the Node.js backend container
    sudo k3s kubectl apply -f 02-server-deployment.yaml

    # Deploys the Next.js frontend container
    sudo k3s kubectl apply -f 03-client-deployment.yaml

    # Tells Traefik to route traffic to the right container
    sudo k3s kubectl apply -f 04-ingress.yaml

─ Step 5: Store your resume as a Secret ─────────────────────

    sudo k3s kubectl create secret generic resume-pdf \
      --from-file=resume.pdf=~/resume.pdf \
      --namespace=portfolio

    # Clean up
    rm ~/resume.pdf

─ Step 6: Watch your pods start ─────────────────────────────

    sudo k3s kubectl get pods -n portfolio -w

  This watches pods in real time. You will see them go through stages:
    Pending        → waiting for image to download
    ContainerCreating → image downloaded, starting up
    Running        → your container is live!

  Wait until BOTH of these show "Running":
    portfolio-client-xxxxx   1/1   Running
    portfolio-server-xxxxx   1/1   Running

  Press Ctrl+C to stop watching.

─ Step 7: Wait for your TLS certificate ─────────────────────

  cert-manager automatically requests a certificate from Let's Encrypt.
  This takes 1-3 minutes.

    sudo k3s kubectl get certificate -n portfolio -w

  Wait for the READY column to show True:
    NAME            READY   SECRET         AGE
    portfolio-tls   True    portfolio-tls  2m

  Press Ctrl+C when you see True.

─ Step 8: Open your site ────────────────────────────────────

  Open your browser and go to:
    https://chetancodes.dpdns.org

  You should see your terminal portfolio!

  If you see a "Not Secure" warning — wait 2 more minutes
  and refresh. The certificate is still being issued.

  If the page doesn't load at all — go to the Troubleshooting section.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — TEST EVERYTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click on the terminal and try each of these:

  help                     → shows all commands
  ls                       → lists files
  cat about.txt            → shows your about info
  ./experience.sh          → shows your work history
  ./projects.sh            → shows your projects
  ./skills.sh              → shows your skills
  ./education.sh           → shows education
  download resume          → downloads your resume PDF
  whoami                   → easter egg
  docker ps                → simulated docker output
  kubectl get pods         → simulated k8s output
  ssh hire-chetan@ubuntu   → spawns a real sandbox container

For the SSH sandbox, you should drop into a real bash session.
Try running ./deploy.sh inside it to see the CI/CD simulation.
Type exit to leave the sandbox.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO UPDATE YOUR SITE IN THE FUTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Whenever you change your info, experience, or code:

1. Make your changes in the files on your laptop

2. Rebuild and push the affected image:

   For backend changes (profile data, commands):
     cd server
     docker build -t ghcr.io/YOUR_USERNAME/portfolio-server:latest .
     docker push ghcr.io/YOUR_USERNAME/portfolio-server:latest
     cd ..

   For frontend changes (landing page, styling):
     cd client
     docker build \
       --build-arg NEXT_PUBLIC_SERVER_URL=https://chetancodes.dpdns.org \
       -t ghcr.io/YOUR_USERNAME/portfolio-client:latest .
     docker push ghcr.io/YOUR_USERNAME/portfolio-client:latest
     cd ..

   For sandbox changes (experience.sh etc.):
     scp -r sandbox/ ubuntu@YOUR_VM_IP:~/sandbox/
     ssh ubuntu@YOUR_VM_IP
     cd ~/sandbox
     docker build -t chetan-sandbox:latest .
     exit

3. Restart the pod on your VM to pull the new image:

   ssh ubuntu@YOUR_VM_IP
   sudo k3s kubectl rollout restart deployment/portfolio-server -n portfolio
   sudo k3s kubectl rollout restart deployment/portfolio-client -n portfolio

   # Watch them restart:
   sudo k3s kubectl get pods -n portfolio -w


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TROUBLESHOOTING — WHAT TO DO WHEN THINGS BREAK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

─ "Site doesn't load at all" ────────────────────────────────

  Check if pods are running:
    sudo k3s kubectl get pods -n portfolio

  If you see "ImagePullBackOff":
    The image name is wrong, or the image is private.
    Fix: double-check the image name in k8s/02-server-deployment.yaml
    Fix: make the GitHub package public (see Phase 4 Step 5)

  If you see "Pending":
    Still downloading the image. Wait 2 minutes and check again.

  If you see "CrashLoopBackOff":
    Container is crashing. See its logs:
    sudo k3s kubectl logs -n portfolio deployment/portfolio-server
    sudo k3s kubectl logs -n portfolio deployment/portfolio-client

  Check ingress:
    sudo k3s kubectl get ingress -n portfolio

─ "Site loads but terminal shows Connecting..." ──────────────

  The WebSocket is not reaching the server.
  Check server logs:
    sudo k3s kubectl logs -n portfolio deployment/portfolio-server -f

  Check the ingress has /socket.io route:
    sudo k3s kubectl get ingress -n portfolio -o yaml | grep socket

─ "Not Secure" / certificate error ──────────────────────────

  Check certificate status:
    sudo k3s kubectl get certificate -n portfolio
    sudo k3s kubectl describe certificate portfolio-tls -n portfolio

  Look for "Events:" at the bottom of describe output.
  Most common cause: port 80 is blocked.
  Let's Encrypt needs to reach your VM on port 80 to verify you own the domain.
  Check OCI Security List has port 80 open AND ufw allows port 80.

─ "Sandbox unavailable" when typing ssh hire-chetan@ubuntu ──

  Docker is not running or sandbox image is missing.
  On your VM:
    sudo systemctl status docker
    docker images | grep chetan-sandbox

  If Docker is stopped:
    sudo systemctl start docker
    sudo systemctl enable docker   ← makes it start automatically on reboot

  If sandbox image is missing:
    cd ~/sandbox
    docker build -t chetan-sandbox:latest .

─ VM runs out of memory ──────────────────────────────────────

  Free tier has 1GB RAM. Check usage:
    free -h

  If low, check what is using memory:
    sudo k3s kubectl top pods -n portfolio

  Sandbox containers use 64MB each, max 5 at once.
  This should be fine for a portfolio site.

─ Something is very broken, I want to start fresh ────────────

  Delete everything and re-apply:
    sudo k3s kubectl delete namespace portfolio
    # Wait 30 seconds
    cd ~/portfolio-k8s
    sudo k3s kubectl apply -f 00-namespace.yaml
    sudo k3s kubectl apply -f 01-configmap.yaml
    sudo k3s kubectl apply -f 05-cert-issuer.yaml
    sudo k3s kubectl apply -f 06-sandbox-rbac.yaml
    sudo k3s kubectl apply -f 02-server-deployment.yaml
    sudo k3s kubectl apply -f 03-client-deployment.yaml
    sudo k3s kubectl apply -f 04-ingress.yaml
    # Re-create resume secret too
    sudo k3s kubectl create secret generic resume-pdf \
      --from-file=resume.pdf=~/resume.pdf \
      --namespace=portfolio


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — COMMANDS YOU WILL USE OFTEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Check everything is running:
    sudo k3s kubectl get all -n portfolio

  See live logs from backend:
    sudo k3s kubectl logs -n portfolio deployment/portfolio-server -f

  See live logs from frontend:
    sudo k3s kubectl logs -n portfolio deployment/portfolio-client -f

  Watch pods update after a rollout:
    sudo k3s kubectl get pods -n portfolio -w

  Check TLS certificate:
    sudo k3s kubectl get certificate -n portfolio

  Check how much RAM each pod uses:
    sudo k3s kubectl top pods -n portfolio

  See active sandbox containers:
    docker ps | grep portfolio-session

  Check VM total RAM:
    free -h

  SSH into your VM:
    ssh ubuntu@YOUR_VM_IP
