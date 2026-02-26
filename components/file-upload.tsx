'use client';

import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';

interface FileUploadProps {
  onScheduleGenerated: (schedule: any) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onScheduleGenerated, onError }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      onError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/schedule', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const schedule = await response.json();
      onScheduleGenerated(schedule);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <>
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="mt-2 text-sm text-gray-600">Processing file...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-blue-600" />
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      </div>
      {fileName && (
        <p className="mt-3 text-sm text-gray-600">
          Selected: <span className="font-semibold">{fileName}</span>
        </p>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-sm mb-3">Excel File Format Required:</h3>
        <div className="text-xs text-gray-700 space-y-2">
          <p>
            <strong>Students Sheet:</strong> ID, Name, Section, Courses (comma-separated)
          </p>
          <p>
            <strong>Courses Sheet:</strong> ID, Name, TeacherID, Duration
          </p>
          <p>
            <strong>Teachers Sheet:</strong> ID, Name, Courses (comma-separated)
          </p>
          <p>
            <strong>Rooms Sheet:</strong> ID, Name, Type (normal/lab/specialized), Capacity
          </p>
        </div>
      </div>
    </div>
  );
}
