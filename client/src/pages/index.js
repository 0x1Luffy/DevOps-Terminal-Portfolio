import Head from "next/head";
import dynamic from "next/dynamic";
import MatrixRain from "../components/MatrixRain";
import HeroSection from "../components/HeroSection";

const TerminalWindow = dynamic(() => import("../components/TerminalWindow"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "clamp(320px,52vw,540px)", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0d1117",
      border:"1px solid #1e2630", borderRadius:"12px",
    }}>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.85rem", color:"#7ee787" }}>
        Initializing terminal_
      </span>
    </div>
  ),
});

export default function Home() {
  const handleLaunchTerminal = () =>
    setTimeout(() =>
      document.getElementById("terminal-section")?.scrollIntoView({ behavior:"smooth" }), 80);

  return (
    <>
      <Head>
        <title>Chetan | DevOps Engineer Portfolio</title>
        <meta name="description" content="Interactive terminal portfolio — explore Chetan's skills, experience and projects by typing real commands." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Chetan | DevOps Engineer Portfolio" />
        <meta property="og:description" content="Interactive terminal portfolio — type commands to explore." />
      </Head>

      <MatrixRain />

      <main style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <HeroSection onLaunchTerminal={handleLaunchTerminal} />

        <section id="terminal-section" style={{
          position:"relative", zIndex:10,
          padding:"1.5rem clamp(0.75rem,4vw,2rem) 5rem",
        }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
              <div style={{ flex:1, height:"1px", background:"#1e2630" }} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem",
                             color:"#8b949e", letterSpacing:"0.15em", textTransform:"uppercase" }}>
                Interactive Terminal
              </span>
              <div style={{ flex:1, height:"1px", background:"#1e2630" }} />
            </div>

            <TerminalWindow />
          </div>
        </section>
      </main>
    </>
  );
}
