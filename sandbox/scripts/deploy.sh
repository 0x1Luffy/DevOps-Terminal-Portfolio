#!/bin/bash
# Simulated CI/CD Pipeline

echo ""
echo -e "\033[1;36m╔══════════════════════════════════════════════════╗\033[0m"
echo -e "\033[1;36m║   🚀 DEPLOYING PORTFOLIO APPLICATION             ║\033[0m"
echo -e "\033[1;36m╚══════════════════════════════════════════════════╝\033[0m"
echo ""

steps=(
  "Running unit tests..."
  "Running integration tests..."
  "Building Docker image..."
  "Scanning image for vulnerabilities..."
  "Pushing image to registry..."
  "Updating Kubernetes manifests..."
  "Rolling deployment started..."
  "Health checks passing..."
  "Deployment complete!"
)

for step in "${steps[@]}"; do
  echo -ne "\033[33m[⏳]\033[0m $step"
  sleep 0.4
  echo -e "\r\033[32m[✓]\033[0m $step"
done

echo ""
echo -e "\033[1;32m✅ Successfully deployed v$(date +%Y.%m.%d) to production!\033[0m"
echo -e "\033[90m   Pipeline duration: ~2 minutes (simulated as 4 seconds)\033[0m"
echo ""
