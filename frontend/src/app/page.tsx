import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function Page() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary dark:text-white">JKExamSpark</div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10">Login</Link>
          <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light">Register Free</Link>
        </div>
      </header>
      
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Background ambient glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 dark:bg-primary/30 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>

        <div className="text-center space-y-8 py-20 relative z-10 animate-fade-in-up">
          <Badge variant="blue" className="px-4 py-1.5 text-sm mb-4 border-primary/20 bg-primary/5 dark:bg-primary/10">Welcome to JKExamSpark</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            JKSSB Preparation <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent">Reimagined for J&K</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Join thousands of JKSSB aspirants. Prepare with timed quizzes, study materials, track your real exam scores, and view dynamic category-wise rankings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link href="/quizzes" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-lg font-bold hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
              Start Preparing Free
            </Link>
            <Link href="/rankings" className="px-8 py-4 bg-white dark:bg-card-dark text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl text-lg font-bold hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-1 transition-all duration-300">
              View Global Rankings
            </Link>
          </div>
          <p className="text-sm text-text-muted mt-8 max-w-md mx-auto">
            Disclaimer: Rankings are based on self-submitted student data. Not affiliated with JKSSB.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 relative z-10">
          {[
            { title: 'Study Materials', desc: 'Access high-quality PDF notes and video lectures curated for the syllabus.', icon: '📚' },
            { title: 'Mock Quizzes', desc: 'Test your knowledge with timed mock exams and negative marking simulation.', icon: '⏱️' },
            { title: 'Score Tracker', desc: 'Keep a secure record of your actual JKSSB exam performance across years.', icon: '📈' },
            { title: 'Category Rankings', desc: 'See where you stand among your peers with detailed category filtering.', icon: '🏆' },
            { title: 'Cutoff Predictor', desc: 'AI-based statistical predictions for expected cutoffs based on submissions.', icon: '🎯' },
            { title: 'Performance Dashboard', desc: 'Analytics to help you visualize your strengths and weaknesses.', icon: '📊' },
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white/60 dark:bg-card-dark/60 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
