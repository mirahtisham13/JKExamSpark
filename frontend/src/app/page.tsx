import Link from 'next/link';

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
      
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-6 py-16">
          <h1 className="text-5xl font-extrabold text-primary dark:text-white tracking-tight">
            JKSSB Exam Preparation Platform <br />
            <span className="text-accent">for Aspirants of J&K</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Join thousands of JKSSB aspirants. Prepare with quizzes, study materials, track real exam scores, and view category-wise rankings.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/login" className="px-8 py-3 bg-primary text-white rounded-md text-lg font-medium hover:bg-primary-light transition-colors">Start Preparing</Link>
            <Link href="/register" className="px-8 py-3 bg-card-light dark:bg-card-dark text-primary dark:text-white border border-gray-200 dark:border-gray-800 rounded-md text-lg font-medium hover:opacity-80 transition-opacity">Register Free</Link>
          </div>
          <p className="text-sm text-text-muted mt-8 max-w-md mx-auto">
            Disclaimer: Rankings are based on self-submitted student data. Not affiliated with JKSSB.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { title: 'Study Materials', desc: 'Access high-quality PDF notes and video lectures' },
            { title: 'Mock Quizzes', desc: 'Test your knowledge with timed mock exams' },
            { title: 'Score Tracker', desc: 'Keep track of your actual exam performance' },
            { title: 'Category Rankings', desc: 'See where you stand among your peers' },
            { title: 'Cutoff Predictor', desc: 'AI-based predictions for expected cutoffs' },
            { title: 'Performance Dashboard', desc: 'Analytics to help you improve' },
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-primary dark:text-white">{feature.title}</h3>
              <p className="text-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
