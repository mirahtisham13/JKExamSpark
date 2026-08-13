'use client';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" required className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" required className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" required className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" />
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light">
        Create Account
      </button>
      <div className="text-center text-sm mt-4">
        Already have an account? <Link href="/login" className="text-accent hover:underline">Sign In</Link>
      </div>
    </form>
  );
}
