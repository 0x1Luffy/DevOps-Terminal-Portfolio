"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

const HINT_COMMANDS = [
  { text: "./experience.sh", color: "#7ee787" },
  { text: "./projects.sh",   color: "#79c0ff" },
  { text: "./skills.sh",     color: "#d2a8ff" },
  { text: "./education.sh",  color: "#e3b341" },
  { text: "cat about.txt",   color: "#39d0d0" },
  { text: "cat contact.txt", color: "#ff7b72" },
  { text: "ls",              color: "#7ee787" },
  { text: "ssh hire-chetan@ubuntu", color: "#39d0d0" },
];

export default function TerminalWindow({ onSocketReady }) {
  const terminalRef  = useRef(null);
  const xtermRef     = useRef(null);
  const fitAddonRef  = useRef(null);
  const socketRef    = useRef(null);
  const inputBufRef  = useRef("");
  const historyRef   = useRef([]);
  const histIdxRef   = useRef(-1);

  const [status, setStatus]           = useState("connecting");
  const [isMaximized, setIsMaximized] = useState(false);
  const [fontSize, setFontSize]       = useState(14);

  // Ghost hint state
  const [hintText, setHintText]   = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const hintStateRef  = useRef({ index: 0, charPos: 0, phase: "gap" });
  const hintTimerRef  = useRef(null);
  const userTypingRef = useRef(false);
  const inSandboxRef  = useRef(false);

  // Responsive font size
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setFontSize(w < 480 ? 11 : w < 768 ? 12 : 14);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const PROMPT = "\r\n\x1b[1;32mguest\x1b[0m\x1b[37m@\x1b[0m\x1b[1;34mportfolio\x1b[0m\x1b[37m:~$\x1b[0m ";
  const writePrompt = useCallback(() => { xtermRef.current?.write(PROMPT); }, []);

  // Ghost hint cycling engine
  useEffect(() => {
    const run = () => {
      if (userTypingRef.current) {
        hintTimerRef.current = setTimeout(run, 200);
        return;
      }
      const s   = hintStateRef.current;
      const cmd = HINT_COMMANDS[s.index].text;

      if (s.phase === "typing") {
        if (s.charPos < cmd.length) {
          s.charPos++;
          setHintText(cmd.slice(0, s.charPos));
          hintTimerRef.current = setTimeout(run, 85);
        } else {
          s.phase = "hold";
          hintTimerRef.current = setTimeout(run, 1800);
        }
      } else if (s.phase === "hold") {
        s.phase = "erasing";
        hintTimerRef.current = setTimeout(run, 40);
      } else if (s.phase === "erasing") {
        if (s.charPos > 0) {
          s.charPos--;
          setHintText(cmd.slice(0, s.charPos));
          hintTimerRef.current = setTimeout(run, 38);
        } else {
          s.phase = "gap";
          hintTimerRef.current = setTimeout(run, 380);
        }
      } else {
        const nextIdx = (s.index + 1) % HINT_COMMANDS.length;
        s.index   = nextIdx;
        s.charPos = 0;
        s.phase   = "typing";
        setHintIndex(nextIdx);
        setHintText("");
        hintTimerRef.current = setTimeout(run, 80);
      }
    };
    hintTimerRef.current = setTimeout(run, 1400);
    return () => clearTimeout(hintTimerRef.current);
  }, []);

  // xterm.js init
  useEffect(() => {
    if (!terminalRef.current) return;
    let dispose;

    const load = async () => {
      const { Terminal }      = await import("@xterm/xterm");
      const { FitAddon }      = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");
      await import("@xterm/xterm/css/xterm.css");

      const term = new Terminal({
        cursorBlink: true, cursorStyle: "block",
        fontSize, fontFamily: "'JetBrains Mono','Fira Code',monospace",
        lineHeight: 1.55, letterSpacing: 0.3,
        allowTransparency: true, scrollback: 1000, convertEol: true,
        theme: {
          background: "transparent", foreground: "#cdd9e5",
          cursor: "#7ee787", cursorAccent: "#0a0e14",
          black: "#0a0e14", red: "#ff7b72", green: "#7ee787",
          yellow: "#e3b341", blue: "#79c0ff", magenta: "#d2a8ff",
          cyan: "#39d0d0", white: "#cdd9e5",
          brightBlack: "#8b949e", brightRed: "#ffa198",
          brightGreen: "#56d364", brightYellow: "#e3b341",
          brightBlue: "#79c0ff", brightMagenta: "#d2a8ff",
          brightCyan: "#39d0d0", brightWhite: "#cdd9e5",
          selectionBackground: "#1e2630",
        },
      });

      const fit   = new FitAddon();
      const links = new WebLinksAddon();
      term.loadAddon(fit); term.loadAddon(links);
      term.open(terminalRef.current);
      fit.fit();
      fitAddonRef.current = fit;
      xtermRef.current    = term;

      const socket = io(SERVER_URL, { transports: ["websocket"] });
      socketRef.current = socket;
      onSocketReady?.(socket);

      socket.on("connect",    () => setStatus("ready"));
      socket.on("disconnect", () => { setStatus("disconnected"); inSandboxRef.current = false; });
      socket.on("output", (d) => term.write(d));
      socket.on("clear",  () => { term.clear(); writePrompt(); });
      socket.on("download_resume", () =>
        window.open(`${SERVER_URL}/api/terminal/resume`, "_blank")
      );
      socket.on("ssh_connected",    () => { inSandboxRef.current = true;  setStatus("sandbox"); });
      socket.on("ssh_disconnected", () => { inSandboxRef.current = false; setStatus("ready"); writePrompt(); });

      // Key handling
      term.onKey(({ key, domEvent: e }) => {
        const sock = socketRef.current;
        if (!sock) return;

        // Sandbox mode — raw keystrokes go to container
        if (inSandboxRef.current) { sock.emit("input", key); return; }

        if (e.keyCode === 13) {                    // Enter
          const cmd = inputBufRef.current.trim();
          if (cmd) { historyRef.current.unshift(cmd); histIdxRef.current = -1; }
          term.write("\r\n");
          if (cmd) { sock.emit("command", cmd); setTimeout(writePrompt, 50); }
          else writePrompt();
          inputBufRef.current  = "";
          userTypingRef.current = false;
          return;
        }
        if (e.keyCode === 8) {                     // Backspace
          if (inputBufRef.current.length > 0) {
            inputBufRef.current = inputBufRef.current.slice(0, -1);
            term.write("\b \b");
          }
          if (inputBufRef.current.length === 0) userTypingRef.current = false;
          return;
        }
        if (e.keyCode === 38) {                    // Up
          e.preventDefault();
          const ni = Math.min(histIdxRef.current + 1, historyRef.current.length - 1);
          if (ni >= 0 && historyRef.current[ni]) {
            term.write("\b \b".repeat(inputBufRef.current.length));
            inputBufRef.current = historyRef.current[ni];
            histIdxRef.current  = ni;
            term.write(inputBufRef.current);
          }
          return;
        }
        if (e.keyCode === 40) {                    // Down
          e.preventDefault();
          const ni = histIdxRef.current - 1;
          term.write("\b \b".repeat(inputBufRef.current.length));
          if (ni >= 0) { histIdxRef.current = ni; inputBufRef.current = historyRef.current[ni]; }
          else { histIdxRef.current = -1; inputBufRef.current = ""; }
          term.write(inputBufRef.current);
          return;
        }
        if (e.keyCode === 9) {                     // Tab
          e.preventDefault();
          const all = ["ls","help","clear","whoami","pwd",
            "cat about.txt","cat contact.txt",
            "./experience.sh","./projects.sh","./skills.sh","./education.sh",
            "download resume","docker ps","kubectl get pods","git log --oneline",
          ];
          const buf = inputBufRef.current;
          const hits = all.filter(c => c.startsWith(buf));
          if (hits.length === 1) { const f = hits[0].slice(buf.length); inputBufRef.current = hits[0]; term.write(f); }
          else if (hits.length > 1) { term.write("\r\n" + hits.join("  ") + "\r\n"); writePrompt(); term.write(buf); }
          return;
        }
        if (e.ctrlKey && e.key === "c") { term.write("^C"); inputBufRef.current = ""; userTypingRef.current = false; writePrompt(); return; }
        if (e.ctrlKey && e.key === "l") { term.clear(); inputBufRef.current = ""; userTypingRef.current = false; writePrompt(); return; }

        if (!e.ctrlKey && !e.altKey && !e.metaKey && key.length === 1) {
          userTypingRef.current = true;
          setHintText("");
          inputBufRef.current += key;
          term.write(key);
        }
      });

      // Paste
      term.onData((d) => {
        if (d.length > 1) {
          userTypingRef.current = true;
          setHintText("");
          const c = d.replace(/[\r\n]/g, "");
          inputBufRef.current += c;
          term.write(c);
        }
      });

      const ro = new ResizeObserver(() => { fit.fit(); socket.emit("resize", { cols: term.cols, rows: term.rows }); });
      ro.observe(terminalRef.current);

      dispose = () => { ro.disconnect(); term.dispose(); socket.disconnect(); };
    };

    load();
    return () => dispose?.();
  }, [fontSize]);

  useEffect(() => { setTimeout(() => fitAddonRef.current?.fit(), 60); }, [isMaximized]);

  const sc = { connecting:"#e3b341", ready:"#7ee787", disconnected:"#ff7b72", sandbox:"#39d0d0" }[status];
  const sl = { connecting:"Connecting…", ready:"Connected", disconnected:"Reconnecting…", sandbox:"Sandbox" }[status];
  const hint = HINT_COMMANDS[hintIndex];

  return (
    <div style={{
      position: isMaximized ? "fixed" : "relative",
      inset:    isMaximized ? "12px" : undefined,
      zIndex:   isMaximized ? 50 : undefined,
      display:"flex", flexDirection:"column",
      background:"#0d1117", border:"1px solid #1e2630",
      borderRadius:"12px", overflow:"hidden",
      boxShadow:"0 0 0 1px #1e2630,0 30px 60px -20px rgba(0,0,0,0.9),0 0 40px rgba(126,231,135,0.04)",
      height: isMaximized ? "auto" : "clamp(320px, 52vw, 540px)",
    }}>

      {/* Title bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 14px", height:"38px", flexShrink:0,
        borderBottom:"1px solid #1e2630", background:"#080c10",
      }}>
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          <div style={{ width:11,height:11,borderRadius:"50%",background:"#ff5f56",opacity:0.85 }} />
          <div style={{ width:11,height:11,borderRadius:"50%",background:"#ffbd2e",opacity:0.85 }} />
          <div onClick={()=>setIsMaximized(v=>!v)}
               style={{ width:11,height:11,borderRadius:"50%",background:"#28c840",opacity:0.85,cursor:"pointer" }} />
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#8b949e" }}>
          guest@portfolio:~
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:sc,display:"block",boxShadow:`0 0 5px ${sc}` }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", color:sc }}>{sl}</span>
          <button onClick={()=>setIsMaximized(v=>!v)}
                  style={{ marginLeft:3,background:"none",border:"none",color:"#8b949e",cursor:"pointer",fontSize:"0.72rem" }}>
            {isMaximized?"⊡":"⊞"}
          </button>
        </div>
      </div>

      {/* xterm body */}
      <div style={{ position:"relative", flex:1, overflow:"hidden" }}>
        <div style={{
          position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
          backgroundImage:"linear-gradient(rgba(126,231,135,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(126,231,135,0.01) 1px,transparent 1px)",
          backgroundSize:"24px 24px",
        }} />
        <div ref={terminalRef} style={{ position:"absolute",inset:0,padding:"10px 12px",background:"transparent" }} />
      </div>

      {/* Ghost hint bar */}
      <div style={{
        borderTop:"1px solid #1e2630", background:"#080c10",
        padding:"7px 14px", display:"flex", alignItems:"center",
        gap:"8px", flexShrink:0, minHeight:"32px",
      }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", color:"#2e3a42", flexShrink:0, userSelect:"none" }}>
          try →
        </span>

        <span style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem",
          color: hint.color, letterSpacing:"0.02em", flexShrink:0,
          opacity: hintText ? 0.65 : 0, transition:"opacity 0.12s ease",
          minWidth: "120px",
        }}>
          {hintText || "\u00a0"}
        </span>

        {hintText && !userTypingRef.current && (
          <span style={{
            display:"inline-block", width:"6px", height:"12px",
            background: hint.color, opacity:0.55, borderRadius:"1px", flexShrink:0,
            animation:"blink 1s step-end infinite",
          }} />
        )}

        <span style={{
          marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace",
          fontSize:"0.58rem", color:"#2a3540", userSelect:"none", whiteSpace:"nowrap",
          display: typeof window !== "undefined" && window.innerWidth < 520 ? "none" : "block",
        }}>
          ↑↓ history · Tab complete
        </span>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:0.55}50%{opacity:0}}`}</style>
    </div>
  );
}
