"use client";
import { useState } from "react";

export default function Home() {
  const [vibe, setVibe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Helper to find 30s preview from Apple Music
  const fetchAudio = async (song: string, artist: string) => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song + " " + artist)}&limit=1&entity=song`);
      const data = await res.json();
      if (data.results && data.results[0]?.previewUrl) {
        setAudioUrl(data.results[0].previewUrl);
      } else {
        setAudioUrl(null);
      }
    } catch (err) {
      console.error("Audio fetch failed:", err);
      setAudioUrl(null);
    }
  };

  const searchMusic = (s: string, a: string, platform: string) => {
    const query = encodeURIComponent(`${s} ${a}`);
    return platform === 'spotify' 
      ? `https://open.spotify.com/search/${query}` 
      : `https://www.youtube.com/results?search_query=${query}`;
  };

  // Logic to refresh info without losing the image
  const handleRefresh = async () => {
    if (!preview) return;
    setLoading(true);
    setVibe(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }), // Re-use the existing base64 image
      });
      const data = await res.json();
      setVibe(data);
      if (data.song && data.artist) await fetchAudio(data.song, data.artist);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
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
      setAudioUrl(null);
      try {
        const res = await fetch("/api/vibe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base }),
        });
        const data = await res.json();
        setVibe(data);
        if (data.song && data.artist) await fetchAudio(data.song, data.artist);
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
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

        {vibe && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="md:col-span-3 bg-white/5 backdrop-blur-3xl border-t border-l border-white/20 p-12 rounded-[3.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black tracking-widest uppercase mb-4 text-cyan-400">Song Selection</span>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-white drop-shadow-2xl leading-tight uppercase">{vibe.song}</h2>
              <p className="text-2xl font-semibold mb-10 text-slate-400 tracking-tight">— {vibe.artist} —</p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 relative z-10 mb-8">
                <a href={searchMusic(vibe.song, vibe.artist, 'spotify')} target="_blank" className="bg-[#1DB954] text-black px-10 py-4 rounded-3xl hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl border-t border-white/20">Spotify</a>
                <a href={searchMusic(vibe.song, vibe.artist, 'youtube')} target="_blank" className="bg-[#FF0000] text-white px-10 py-4 rounded-3xl hover:bg-red-500 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl border-t border-white/20">YouTube</a>
                <button onClick={() => {navigator.clipboard.writeText(`${vibe.song} by ${vibe.artist}`); alert("Captured!");}} className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-3xl border-t border-l border-white/10 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase backdrop-blur-md">Copy</button>
                
                {/* NEW RE-DISTILL BUTTON */}
                <button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="bg-white/5 hover:bg-cyan-500 hover:text-black px-10 py-4 rounded-3xl border-t border-l border-white/10 hover:scale-110 active:scale-95 transition-all text-[11px] font-black tracking-widest uppercase backdrop-blur-md flex items-center gap-2"
                >
                  <svg className={`w-3 h-3 fill-current ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  Generate Again
                </button>
              </div>

              {/* LIVE AUDIO PLAYER */}
              {audioUrl && (
                <div className="w-full max-w-md mx-auto p-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 shadow-2xl transition-all duration-500 hover:bg-white/10">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center animate-pulse flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1 truncate">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Live Preview</p>
                      <h3 className="text-xl font-bold text-white truncate italic uppercase">{vibe.song}</h3>
                      <p className="text-sm text-slate-400 truncate font-semibold">{vibe.artist}</p>
                    </div>
                  </div>
                  <audio src={audioUrl} controls autoPlay className="w-full h-8 opacity-40 hover:opacity-100 transition-all invert brightness-200" />
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] md:col-span-2 shadow-lg">
              <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">Why this one?</h3>
              <p className="text-slate-100 text-base leading-relaxed font-semibold ">"{vibe.logic}"</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center items-center shadow-lg transition-all hover:scale-105">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Rating</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">{vibe.rating}</span>
                <span className="text-xl font-black text-slate-500">/10</span>
              </div>
            </div>

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
            <a href="https://github.com/harshit-911" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white text-black px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              GitHub
            </a>
          </div>
        </div>
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
