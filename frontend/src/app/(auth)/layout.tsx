export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md p-8 bg-card-light dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-white">JKExamSpark</h1>
          <p className="text-text-muted mt-2">Welcome back to your preparation journey</p>
        </div>
        {children}
      </div>
    </div>
  );
}
