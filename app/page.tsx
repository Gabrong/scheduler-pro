'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { ScheduleDisplay } from '@/components/schedule-display';
import { AuthButton } from '@/components/auth-button';
import { useAuth } from '@/lib/auth-context';
import { SectionSchedule } from '@/lib/scheduler';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [schedule, setSchedule] = useState<SectionSchedule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleScheduleGenerated = (scheduleData: any) => {
    if (scheduleData.sectionSchedules) {
      setSchedule(scheduleData.sectionSchedules);
      setError(null);
      setShowSchedule(true);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSchedule(null);
    setShowSchedule(false);
  };

  const handleReset = () => {
    setSchedule(null);
    setError(null);
    setShowSchedule(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                School Schedule Pro
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sign In Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in with Google to access the schedule generator.
              </p>
              <p className="text-sm text-gray-500">
                Your data is securely managed through Supabase authentication.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upload Schedule Data
                </h2>
                <FileUpload
                  onScheduleGenerated={handleScheduleGenerated}
                  onError={handleError}
                />

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {showSchedule && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800">Success!</p>
                        <p className="text-sm text-green-700 mt-1">
                          Schedule generated successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {schedule && (
                  <button
                    onClick={handleReset}
                    className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                  >
                    Generate New Schedule
                  </button>
                )}
              </div>

              {/* Info Section */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  About This App
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">⏰ Hours:</span> 7 AM - 3 PM
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">📚 Constraints:</span>
                    <br />
                    Max 2 consecutive classes for students & teachers
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">☕ Breaks:</span>
                    <br />
                    Staggered recess (30 min) & lunch (1 hour)
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">📊 Format:</span>
                    <br />
                    Excel (.xlsx) with defined sheets
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Display Section */}
            {showSchedule && schedule && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Generated Schedule
                  </h2>
                  <ScheduleDisplay sectionSchedules={schedule} />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!showSchedule && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Upload an Excel file to generate a schedule</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; 2024 School Schedule Pro. Built with Next.js and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
