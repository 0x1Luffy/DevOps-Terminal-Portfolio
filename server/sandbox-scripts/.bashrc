# Chetan's Portfolio Sandbox .bashrc

export TERM=xterm-256color
export PS1='\[\033[1;32m\]chetan@sandbox\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]$ '

# Welcome message on login
cat << 'EOF'

  ╔══════════════════════════════════════════════════╗
  ║   🐧 Welcome to Chetan's Sandbox Environment    ║
  ╚══════════════════════════════════════════════════╝

  You're inside an isolated Docker container!
  This is a safe, resource-limited environment.

  Available commands:
    ls                    - list files
    cat about.txt         - about me
    ./experience.sh       - work history
    ./projects.sh         - portfolio projects
    ./skills.sh           - technical skills
    ./education.sh        - education & certs
    ./deploy.sh           - simulated CI/CD run
    tree                  - file tree view
    exit                  - close session

  ─────────────────────────────────────────────────

EOF

alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
