export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" defaultValue="Student Name" className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (Read Only)</label>
            <input type="email" defaultValue="student@example.com" disabled className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-900 dark:border-gray-700 cursor-not-allowed" />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
