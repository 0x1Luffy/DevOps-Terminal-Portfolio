export TERM=xterm-256color
export PATH=/usr/local/bin:/usr/bin:/bin
export HOME=/home/chetan

# Clean, friendly prompt
PS1='\[\033[1;32m\]chetan\[\033[0m\]@\[\033[1;34msandbox\[\033[0m\]:\[\033[33m\]\w\[\033[0m\]$ '

# Disable history file (security: don't store anything)
unset HISTFILE
HISTSIZE=0

# Welcome banner
cat << 'BANNER'

  ╔═══════════════════════════════════════════════╗
  ║  🐧  Chetan's Sandbox — Isolated Environment  ║
  ╚═══════════════════════════════════════════════╝

  You are inside a secure, isolated container.
  Nothing here connects to the real server.

  Files available:
    about.txt · contact.txt

  Scripts to run:
    ./experience.sh   work history
    ./projects.sh     portfolio projects
    ./skills.sh       technical skills
    ./education.sh    education & certs
    ./deploy.sh       watch a CI/CD pipeline

  Type  ls      to see all files
  Type  exit    to leave the sandbox

BANNER
