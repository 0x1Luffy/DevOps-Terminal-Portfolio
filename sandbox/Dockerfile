# ─────────────────────────────────────────────────────────────
#  SANDBOX CONTAINER — chetan-sandbox:latest
#
#  What this is:
#    A tiny, locked-down Alpine Linux container that acts as the
#    "fake SSH environment" recruiters interact with.
#
#  Security measures baked in:
#    • Non-root user (uid 2000) — can't touch system files
#    • Read-only root filesystem — can't write anywhere except /tmp
#    • No network access at runtime (set in K8s securityContext)
#    • No sudo, no su, no package managers
#    • Only hand-picked binaries available (bash, cat, ls, tree)
#    • All scripts are pre-baked — nothing can be installed
#    • Even if someone escapes the process, they hit a container
#      boundary, not your VM
# ─────────────────────────────────────────────────────────────

FROM alpine:3.19

# Install ONLY the minimal tools we expose to users
# No curl, no wget, no apk after this point
RUN apk add --no-cache \
    bash \
    coreutils \
    tree \
    ncurses \
  && rm -rf /var/cache/apk/*

# Remove tools that could be dangerous
RUN rm -f /usr/bin/wget /usr/bin/curl /sbin/apk \
          /bin/su /usr/bin/sudo /bin/busybox

# Create the non-root sandbox user
RUN addgroup -g 2000 sandbox && \
    adduser -D -u 2000 -G sandbox -s /bin/bash -h /home/chetan chetan

# ── Copy portfolio scripts into the container ──────────────
WORKDIR /home/chetan

COPY scripts/about.txt       ./about.txt
COPY scripts/contact.txt     ./contact.txt
COPY scripts/experience.sh   ./experience.sh
COPY scripts/projects.sh     ./projects.sh
COPY scripts/skills.sh       ./skills.sh
COPY scripts/education.sh    ./education.sh
COPY scripts/deploy.sh       ./deploy.sh
COPY scripts/.bashrc         ./.bashrc

# Make scripts executable, owned by sandbox user
RUN chmod +x *.sh && \
    chown -R chetan:sandbox /home/chetan

# Switch to non-root user — NEVER run as root
USER chetan

# Default command: interactive bash login shell
CMD ["/bin/bash", "--login"]
