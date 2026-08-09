'use client'

import { useState } from 'react'
import { submitScore } from '@/app/actions/scores'

export default function DashboardClient({ exams, userScores }: { exams: any[], userScores: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const categories = ['OM', 'RBA', 'SC', 'ST', 'ALC/IB', 'EWS', 'PSP']

  const submittedExamIds = new Set(userScores.map(s => s.examId))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await submitScore(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // reset form
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-6">Submit Your Score</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-6 text-sm">
          Score submitted successfully! Predictions have been updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Select Exam</label>
          <select name="examId" required className="input-premium appearance-none">
            <option value="" className="bg-slate-900">-- Choose Exam --</option>
            {exams.map(exam => (
              <option 
                key={exam.id} 
                value={exam.id}
                disabled={submittedExamIds.has(exam.id)}
                className="bg-slate-900"
              >
                {exam.name} {submittedExamIds.has(exam.id) ? '(Submitted)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
          <select name="category" required className="input-premium appearance-none">
            <option value="" className="bg-slate-900">-- Choose Category --</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Your Score</label>
          <input type="number" step="0.01" name="score" required className="input-premium" placeholder="e.g. 85.5" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Submitting...' : 'Submit Score'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-slate-300 mb-4 tracking-wide uppercase">Your Submissions</h4>
        {userScores.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No scores submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {userScores.map(score => {
              const examName = exams.find(e => e.id === score.examId)?.name
              return (
                <li key={score.id} className="flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                  <span className="font-medium text-slate-200">{examName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-blue-200 px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm shadow-inner uppercase tracking-wider">{score.category}</span>
                    <span className="text-xl font-bold text-indigo-300 drop-shadow-md">{score.score}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
