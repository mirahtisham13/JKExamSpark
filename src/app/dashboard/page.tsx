import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import DashboardClient from './DashboardClient'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { scores: true }
  })

  const exams = await prisma.exam.findMany()

  return (
    <div className="min-h-screen text-white p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Orbs for Glassmorphism */}
      <div className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12 glass-panel p-4 rounded-2xl relative z-10">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:opacity-80 transition-opacity">
          RankJK
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 hidden sm:inline-block">Welcome, <span className="font-semibold text-white">{user?.name}</span></span>
          <form action={logout}>
            <button className="text-sm bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 px-4 py-2 rounded-xl transition-colors">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Dashboard</h2>
            <p className="text-slate-400">Submit your scores to contribute to the live predictions.</p>
          </div>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
            View Live Cutoffs <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        
        <DashboardClient exams={exams} userScores={user?.scores || []} />
      </main>
    </div>
  )
}
