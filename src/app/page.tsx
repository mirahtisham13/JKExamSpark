import Link from 'next/link'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { seedExams } from '@/app/actions/scores'

export default async function Home() {
  const session = await getSession()
  
  // Ensure exams exist in DB for testing
  await seedExams()

  const exams = await prisma.exam.findMany({
    include: { scores: true }
  })

  // Calculate cutoffs for each exam dynamically
  const examStats = exams.map((exam: any) => {
    const categoryScores: Record<string, number[]> = {}
    exam.scores.forEach((s: any) => {
      if (!categoryScores[s.category]) categoryScores[s.category] = []
      categoryScores[s.category].push(s.score)
    })

    const cutoffs: Record<string, number> = {}
    
    Object.keys(categoryScores).forEach(cat => {
      const scores = categoryScores[cat].sort((a, b) => b - a)
      if (scores.length > 0) {
        // e.g. top 30% passes
        const cutoffIndex = Math.max(0, Math.floor(scores.length * 0.3) - 1)
        cutoffs[cat] = scores[cutoffIndex]
      }
    })

    return {
      id: exam.id,
      name: exam.name,
      totalParticipants: exam.scores.length,
      cutoffs
    }
  })

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Decorative Orbs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center justify-center p-4">
        
        <div className="max-w-4xl w-full glass-panel p-10 md:p-16 rounded-3xl text-center space-y-8 relative z-10 border border-white/10 shadow-2xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-sm font-medium tracking-wide mb-2 backdrop-blur-md">
            🚀 The Next-Gen Prediction Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Rank<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">JK</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Crowdsourced cutoff predictions for JKSSB and other competitive exams. Upload your score and see where you stand instantly.
          </p>
          
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto text-lg px-8">
                Submit Your Score 📝
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-primary w-full sm:w-auto text-lg px-8">
                  Sign in to Submit Score
                </Link>
                <Link href="/signup" className="px-8 py-3 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all w-full sm:w-auto">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Predictions Section */}
      <section className="max-w-6xl mx-auto px-4 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Live Cutoff Predictions
          </h2>
          <p className="text-slate-400 text-lg">Real-time category-wise cutoffs based on crowdsourced data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {examStats.map((stat: any) => (
            <div key={stat.id} className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex justify-between items-start mb-8 border-b border-slate-700/50 pb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">{stat.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-sm text-slate-400 font-medium">{stat.totalParticipants} students participated</p>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                {stat.totalParticipants === 0 ? (
                  <div className="py-8 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 italic">No scores submitted yet.</p>
                    <Link href={session ? "/dashboard" : "/login"} className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block">
                      Be the first to submit →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.keys(stat.cutoffs).length === 0 ? (
                      <p className="text-slate-400 italic text-sm col-span-full">Not enough data for predictions.</p>
                    ) : (
                      Object.entries(stat.cutoffs).map(([cat, cutoff]) => (
                        <div key={cat} className="bg-[#0f172a]/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner flex flex-col items-center justify-center transform transition-transform hover:scale-105">
                          <div className="text-xs font-semibold tracking-wider text-slate-400 mb-2 uppercase">{cat}</div>
                          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-200 to-indigo-400">
                            {(cutoff as number).toFixed(1)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
