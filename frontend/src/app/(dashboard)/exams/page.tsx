import Link from 'next/link';

export default function ExamsPage() {
  const exams = [
    { id: '1', name: 'JKSSB Finance Account Assistant', year: 2024, status: 'UPCOMING', marks: 120, vacancies: 972 },
    { id: '2', name: 'JKSSB Junior Assistant', year: 2024, status: 'ACTIVE', marks: 100, vacancies: 1500 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{exam.name}</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{exam.status}</span>
            </div>
            <div className="text-sm text-text-muted space-y-2">
              <p>Year: {exam.year}</p>
              <p>Total Marks: {exam.marks}</p>
              <p>Vacancies: {exam.vacancies}</p>
            </div>
            <Link href={`/exams/${exam.id}`} className="mt-4 inline-block text-accent hover:underline">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
