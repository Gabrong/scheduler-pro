'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut, LogIn } from 'lucide-react';

export function AuthButton() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="text-gray-700">Welcome, <span className="font-semibold">{user.email}</span></p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      <LogIn className="w-4 h-4" />
      Sign In with Google
    </button>
  );
}
