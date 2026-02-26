'use client';

import React, { useState } from 'react';
import { Clock, Users, MapPin, Utensils, Coffee } from 'lucide-react';
import { ScheduledClass, SectionSchedule } from '@/lib/scheduler';

interface ScheduleDisplayProps {
  sectionSchedules: SectionSchedule[];
}

export function ScheduleDisplay({ sectionSchedules }: ScheduleDisplayProps) {
  const [selectedSection, setSelectedSection] = useState(
    sectionSchedules[0]?.section || ''
  );

  const currentSchedule = sectionSchedules.find(
    (s) => s.section === selectedSection
  );

  if (!currentSchedule) {
    return <div className="text-center text-gray-500">No schedule available</div>;
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="w-full space-y-4">
      {/* Section Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sectionSchedules.map((schedule) => (
          <button
            key={schedule.section}
            onClick={() => setSelectedSection(schedule.section)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              selectedSection === schedule.section
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {schedule.section}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-blue-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Time</th>
              <th className="px-4 py-2 text-left font-semibold">Course</th>
              <th className="px-4 py-2 text-left font-semibold">Teacher</th>
              <th className="px-4 py-2 text-left font-semibold">Room</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, index) => {
              const isRecess = currentSchedule.breaks.recess.some(
                (r) => r.hour === time.hour
              );
              const isLunch = currentSchedule.breaks.lunch.some(
                (l) => l.hour === time.hour
              );
              const classAtTime = currentSchedule.schedule.find(
                (c) => c.startTime === time.startTime
              );

              if (isRecess) {
                return (
                  <tr key={`recess-${time.hour}`} className="bg-yellow-50 border-b">
                    <td className="px-4 py-3 font-medium">{time.startTime}</td>
                    <td colSpan={3} className="px-4 py-3">
                      <div className="flex items-center gap-2 text-yellow-700 font-medium">
                        <Coffee className="w-4 h-4" />
                        Recess
                      </div>
                    </td>
                  </tr>
                );
              }

              if (isLunch) {
                return (
                  <tr key={`lunch-${time.hour}`} className="bg-orange-50 border-b">
                    <td className="px-4 py-3 font-medium">{time.startTime}</td>
                    <td colSpan={3} className="px-4 py-3">
                      <div className="flex items-center gap-2 text-orange-700 font-medium">
                        <Utensils className="w-4 h-4" />
                        Lunch
                      </div>
                    </td>
                  </tr>
                );
              }

              if (classAtTime) {
                return (
                  <tr key={classAtTime.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {time.startTime}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {classAtTime.courseName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {classAtTime.students.length} students
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {classAtTime.teacherName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        {classAtTime.roomName}
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={`empty-${time.hour}`} className="border-b bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{time.startTime}</td>
                  <td colSpan={3} className="px-4 py-3 text-gray-400 italic">
                    Free Period
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700">Class</p>
          <p className="text-sm text-gray-600">Scheduled course</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700">Recess</p>
          <p className="text-sm text-gray-600">30 minutes break</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700">Lunch</p>
          <p className="text-sm text-gray-600">1 hour break</p>
        </div>
      </div>
    </div>
  );
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 7; hour < 15; hour++) {
    slots.push({
      startTime: `${hour}:00`,
      hour,
    });
  }
  return slots;
}
