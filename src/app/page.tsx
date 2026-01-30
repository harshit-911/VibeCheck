"use client";
import { useState } from "react";

export default function Home() {
  const [vibe, setVibe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const searchMusic = (s: string, a: string, platform: string) => {
    const query = encodeURIComponent(`${s} ${a}`);
    return platform === 'spotify' 
      ? `https://open.spotify.com/search/${query}` 
      : `https://www.youtube.com/results?search_query=${query}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base = reader.result as string;
      setPreview(base);
      setLoading(true);
      setVibe(null);
      try {
        const res = await fetch("/api/vibe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base }),
        });
        setVibe(await res.json());
      } catch (err) {
        console.error("Vibe check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-[#000810] text-slate-100 flex flex-col items-center py-12 px-6 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Liquid Mesh Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* UPDATED: Marquee News Ticker Header */}
        <header className="text-center space-y-3 overflow-hidden py-4 relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#000810] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#000810] to-transparent z-20 pointer-events-none" />
          
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <h1 key={i} className="text-7xl font-black italic tracking-tighter px-8 bg-gradient-to-tr from-white via-slate-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                VIBE CHECK 
              </h1>
            ))}
          </div>
          
          <p className="text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase">By Larryplanet</p>
        </header>
        
        {/* Main Dashboard with Image Preview */}
        <div className="bg-slate-900/40 p-1 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gradient-to-br from-white/[0.08] to-transparent rounded-[3.2rem] items-center">
            <div className="relative aspect-[4/5] bg-black/60 rounded-[2.2rem] overflow-hidden border border-white/10 group shadow-inner">
              {preview ? (
                <img src={preview} alt="Preview" className="object-cover w-full h-full brightness-90 transition-all duration-700" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-700 font-bold text-xs uppercase tracking-tighter bg-[#030712]">Upload Here</div>
              )}
              <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
              <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black px-4 py-2 rounded-full shadow-lg">New Input</span>
              </div>
            </div>
            
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-4xl font-bold tracking-tighter text-white leading-none ">Your Aesthetic, <br/> Amplified.</h2>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">Upload an image, get a music recommendation.<br/>It's that simple.</p>
              {!preview && <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <div className="w-2 h-2 bg-cyan-500 rounded-full" />
              </div>}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-12 space-y-6">
            <div className="relative w-48 h-[1px] bg-white/5 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[loading_2s_infinite] shadow-[0_0_15px_cyan]" />
            </div>
            <p className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase italic">Cooking...</p>
          </div>
        )}

        {/* BENTO GRID RESULTS */}
        {vibe && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* ANTHEM CARD */}
            <div className="md:col-span-3 bg-white/5 backdrop-blur-3xl border-t border-l border-white/20 p-12 rounded-[3.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black tracking-widest uppercase mb-4 text-cyan-400">Song Selection</span>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-white drop-shadow-2xl leading-tight uppercase">{vibe.song}</h2>
              <p className="text-2xl font-semibold mb-10 text-slate-400 tracking-tight">— {vibe.artist} —</p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 relative z-10">
                <a href={searchMusic(vibe.song, vibe.artist, 'spotify')} target="_blank" className="bg-[#1DB954] text-black px-10 py-4 rounded-3xl hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl border-t border-white/20">Spotify</a>
                <a href={searchMusic(vibe.song, vibe.artist, 'youtube')} target="_blank" className="bg-[#FF0000] text-white px-10 py-4 rounded-3xl hover:bg-red-500 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl border-t border-white/20">YouTube</a>
                <button onClick={() => {navigator.clipboard.writeText(`${vibe.song} by ${vibe.artist}`); alert("Captured!");}} className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-3xl border-t border-l border-white/10 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase backdrop-blur-md">Copy</button>
              </div>
            </div>

            {/* STRATEGY CARD (LOGIC) */}
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] md:col-span-2 shadow-lg">
              <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">Why this one?</h3>
              <p className="text-slate-100 text-base leading-relaxed font-semibold ">"{vibe.logic}"</p>
            </div>

            {/* RATING CARD */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center items-center shadow-lg transition-all hover:scale-105">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Rating</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {vibe.rating}
                </span>
                <span className="text-xl font-black text-slate-500">/10</span>
              </div>
            </div>

            {/* HYPE & PRO TIP */}
            <div className="bg-emerald-500/5 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] md:col-span-2 shadow-xl">
              <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3 ">Need Compliments? </h3>
              <p className="text-zinc-100 text-sm leading-relaxed font-semibold">{vibe.compliment}</p>
            </div>

            <div className="bg-cyan-500/5 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-xl">
              <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3 ">Pro Tip</h3>
              <p className="text-zinc-100 text-sm leading-relaxed font-semibold">{vibe.tip}</p>
            </div>
          </div>
        )}
      </div>

     <footer className="mt-24 pb-12 w-full max-w-2xl relative z-10">
      <div className="bg-white/5 backdrop-blur-3xl border-t border-l border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between group transition-all duration-500 hover:bg-white/[0.08] mb-12">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Developer</h3>
          <p className="text-2xl font-black tracking-tighter text-white">Harshit Sahu</p>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <a
            href="https://github.com/harshit-911"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white text-black px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-[11px] font-black tracking-[0.3em] uppercase bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Keep Posting
          </h4>
          <p className="text-[9px] text-cyan-500/40 font-bold tracking-widest uppercase">
            Version 1.1
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[9px] font-black text-slate-400 tracking-tighter uppercase">Link Active</span>
          </div>
          <p className="text-[9px] font-black text-slate-700 tracking-[0.5em] uppercase">
            GEMINI 2.5 FLASH
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-cyan-500/5 blur-[100px] pointer-events-none" />
    </footer>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(150%) skewX(-20deg); opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </main>
  );
}
