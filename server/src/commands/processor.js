const {
  lsOutput, aboutOutput, experienceOutput, projectsOutput,
  skillsOutput, educationOutput, contactOutput, helpOutput,
} = require("../data/profile");

const EASTER_EGGS = {
  "sudo rm -rf /":    "\x1b[31m⚠  Nice try! Permission denied. 😄\x1b[0m",
  "sudo hire chetan": "\x1b[1;32m✅ sudo: granting hire privileges…\x1b[0m\n\x1b[90m(Just kidding — but seriously, let's talk!)\x1b[0m",
  whoami:             "\x1b[32mchetan — DevOps Engineer, Cloud Architect, Problem Solver\x1b[0m",
  pwd:                "\x1b[32m/home/chetan/portfolio\x1b[0m",
  "uname -a":         "\x1b[32mLinux portfolio 5.15.0 #1 SMP x86_64 GNU/Linux\x1b[0m",
  "docker ps":        "\x1b[33mCONTAINER ID   IMAGE              STATUS\x1b[0m\na1b2c3d4e5f6   chetan/portfolio   Up 2 hours\n\x1b[90m(Simulated)\x1b[0m",
  "kubectl get pods": "\x1b[33mNAME                         READY   STATUS\x1b[0m\nportfolio-7d9f4b5c8-xk2pq    1/1     Running\n\x1b[90m(Simulated)\x1b[0m",
  "git log --oneline":"\x1b[33ma1b2c3d\x1b[0m feat: add interactive terminal portfolio\n\x1b[33mb2c3d4e\x1b[0m fix: container resource limits",
  "./deploy.sh":      "\x1b[1;32m[CI/CD]\x1b[0m Triggering pipeline…\n\x1b[32m[✓]\x1b[0m Tests passed (42/42)\n\x1b[32m[✓]\x1b[0m Docker image built\n\x1b[32m[✓]\x1b[0m Deployed to production ✨",
  matrix:             "\x1b[32mWake up, Neo…\x1b[0m\n\x1b[90m(I can set up your infra though!)\x1b[0m",
  "ping google.com":  "\x1b[32mPING google.com\n64 bytes icmp_seq=0 time=12.3ms\n2 packets, 0% loss\x1b[0m",
};

function processCommand(input) {
  const cmd = input.trim();
  if (!cmd) return "";
  if (EASTER_EGGS[cmd.toLowerCase()]) return EASTER_EGGS[cmd.toLowerCase()];

  switch (cmd.toLowerCase()) {
    case "help":            return helpOutput;
    case "ls": case "ls -la": case "ls -l": return lsOutput;
    case "cat about.txt":   return aboutOutput;
    case "cat contact.txt": return contactOutput;
    case "./experience.sh": case "bash experience.sh": return experienceOutput;
    case "./projects.sh":   case "bash projects.sh":   return projectsOutput;
    case "./skills.sh":     case "bash skills.sh":     return skillsOutput;
    case "./education.sh":  case "bash education.sh":  return educationOutput;
    case "clear":           return "__CLEAR__";
    case "download resume": case "cat resume.pdf":     return "__DOWNLOAD_RESUME__";
    case "ssh hire-chetan@ubuntu":
    case "ssh chetan@sandbox":
    case "ssh sandbox":     return "__SPAWN_SANDBOX__";
    default:
      if (cmd.startsWith("cat "))  return `\x1b[31mcat: ${cmd.slice(4)}: No such file\x1b[0m`;
      if (cmd.startsWith("./"))    return `\x1b[31mbash: ${cmd}: not found\x1b[0m`;
      return `\x1b[31mCommand not found: ${cmd}\x1b[0m\n\x1b[90mType 'help' for available commands.\x1b[0m`;
  }
}

module.exports = { processCommand };
