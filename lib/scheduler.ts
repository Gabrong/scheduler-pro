// Types for scheduling
export interface Student {
  id: string;
  name: string;
  section: string;
  courses: string[];
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  duration: number; // in hours
}

export interface Teacher {
  id: string;
  name: string;
  courses: string[];
}

export interface Room {
  id: string;
  name: string;
  type: 'normal' | 'lab' | 'specialized';
  capacity: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  hour: number;
}

export interface ScheduledClass {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  section: string;
  startTime: string;
  endTime: string;
  students: string[];
}

export interface SectionSchedule {
  section: string;
  schedule: ScheduledClass[];
  breaks: {
    recess: TimeSlot[];
    lunch: TimeSlot[];
  };
}

export interface ScheduleOutput {
  sectionSchedules: SectionSchedule[];
  teacherSchedules: Map<string, ScheduledClass[]>;
  roomSchedules: Map<string, ScheduledClass[]>;
}

// Constants
const SCHOOL_START = 7; // 7 AM
const SCHOOL_END = 15; // 3 PM
const TOTAL_HOURS = SCHOOL_END - SCHOOL_START;
const RECESS_DURATION = 0.5; // 30 minutes
const LUNCH_DURATION = 1; // 1 hour
const MAX_CONSECUTIVE_CLASSES = 2;

// Generate time slots for the day
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = SCHOOL_START; hour < SCHOOL_END; hour++) {
    slots.push({
      startTime: `${hour}:00`,
      endTime: `${hour + 1}:00`,
      hour,
    });
  }
  return slots;
}

// Check if time slot is available (not break time)
function isBreakTime(hour: number, breakHours: number[]): boolean {
  return breakHours.includes(hour);
}

// Check if a teacher can teach at a specific time
function canTeachAtTime(
  teacherId: string,
  hour: number,
  teacherSchedules: Map<string, ScheduledClass[]>,
  breakHours: number[]
): boolean {
  if (isBreakTime(hour, breakHours)) return false;

  const teacherClasses = teacherSchedules.get(teacherId) || [];
  const classesAtThisHour = teacherClasses.filter(
    (c) => c.startTime.split(':')[0] === String(hour)
  );

  if (classesAtThisHour.length > 0) return false;

  // Check for consecutive classes constraint
  const consecutiveCount = teacherClasses.filter(
    (c) => {
      const classHour = parseInt(c.startTime.split(':')[0]);
      return Math.abs(classHour - hour) <= MAX_CONSECUTIVE_CLASSES;
    }
  ).length;

  return consecutiveCount < MAX_CONSECUTIVE_CLASSES;
}

// Check if all students in a section can attend class at this time
function canSectionAttendAtTime(
  section: string,
  hour: number,
  sectionSchedules: Map<string, ScheduledClass[]>,
  breakHours: number[]
): boolean {
  if (isBreakTime(hour, breakHours)) return false;

  const sectionClasses = sectionSchedules.get(section) || [];
  const classesAtThisHour = sectionClasses.filter(
    (c) => c.startTime.split(':')[0] === String(hour)
  );

  if (classesAtThisHour.length > 0) return false;

  // Check for consecutive classes constraint
  const consecutiveCount = sectionClasses.filter(
    (c) => {
      const classHour = parseInt(c.startTime.split(':')[0]);
      return Math.abs(classHour - hour) <= MAX_CONSECUTIVE_CLASSES;
    }
  ).length;

  return consecutiveCount < MAX_CONSECUTIVE_CLASSES;
}

// Check if room is available at specific time
function isRoomAvailable(
  roomId: string,
  hour: number,
  roomSchedules: Map<string, ScheduledClass[]>
): boolean {
  const roomClasses = roomSchedules.get(roomId) || [];
  return !roomClasses.some((c) => c.startTime.split(':')[0] === String(hour));
}

// Main scheduling algorithm
export function generateSchedule(
  students: Student[],
  courses: Map<string, Course>,
  teachers: Map<string, Teacher>,
  rooms: Room[]
): ScheduleOutput {
  const sectionSchedules = new Map<string, ScheduledClass[]>();
  const teacherSchedules = new Map<string, ScheduledClass[]>();
  const roomSchedules = new Map<string, ScheduledClass[]>();

  // Get unique sections
  const sections = [...new Set(students.map((s) => s.section))];

  // Define staggered break times for different sections
  const recessHours = Math.floor(SCHOOL_START + TOTAL_HOURS / 3); // Around 10-11 AM
  const lunchHours = Math.floor(SCHOOL_START + (TOTAL_HOURS * 2) / 3); // Around 1-2 PM

  const breakSchedules: Record<string, { recess: number[]; lunch: number[] }> = {};

  // Stagger breaks across sections
  sections.forEach((section, index) => {
    const offset = index % 2;
    breakSchedules[section] = {
      recess: [recessHours + offset],
      lunch: [lunchHours + offset],
    };
  });

  // Group students by section and get their course requirements
  const sectionCourses: Map<string, Course[]> = new Map();
  const sectionStudents: Map<string, Student[]> = new Map();

  students.forEach((student) => {
    if (!sectionStudents.has(student.section)) {
      sectionStudents.set(student.section, []);
      sectionCourses.set(student.section, []);
    }

    sectionStudents.get(student.section)!.push(student);

    student.courses.forEach((courseId) => {
      const course = courses.get(courseId);
      if (course) {
        const sectionCourseList = sectionCourses.get(student.section)!;
        if (!sectionCourseList.find((c) => c.id === courseId)) {
          sectionCourseList.push(course);
        }
      }
    });
  });

  // Initialize schedules
  sections.forEach((section) => {
    sectionSchedules.set(section, []);
  });

  teachers.forEach((teacher) => {
    teacherSchedules.set(teacher.id, []);
  });

  rooms.forEach((room) => {
    roomSchedules.set(room.id, []);
  });

  // Schedule classes for each section
  sections.forEach((section) => {
    const coursesToSchedule = sectionCourses.get(section) || [];
    const sectionStudentsList = sectionStudents.get(section) || [];
    const breaks = breakSchedules[section];

    // Convert break hours to array
    const allBreakHours = [...breaks.recess, ...breaks.lunch];

    coursesToSchedule.forEach((course) => {
      let scheduled = false;

      // Try to schedule the course
      for (let hour = SCHOOL_START; hour < SCHOOL_END && !scheduled; hour++) {
        if (allBreakHours.includes(hour)) continue;

        const teacher = teachers.get(course.teacherId);
        if (!teacher) continue;

        // Find available room
        for (const room of rooms) {
          if (
            canSectionAttendAtTime(
              section,
              hour,
              sectionSchedules,
              allBreakHours
            ) &&
            canTeachAtTime(course.teacherId, hour, teacherSchedules, []) &&
            isRoomAvailable(room.id, hour, roomSchedules)
          ) {
            // Create scheduled class
            const scheduledClass: ScheduledClass = {
              id: `${section}-${course.id}-${hour}`,
              courseId: course.id,
              courseName: course.name,
              teacherId: course.teacherId,
              teacherName: teacher.name,
              roomId: room.id,
              roomName: room.name,
              section,
              startTime: `${hour}:00`,
              endTime: `${hour + 1}:00`,
              students: sectionStudentsList.map((s) => s.id),
            };

            // Add to all schedules
            sectionSchedules.get(section)!.push(scheduledClass);
            teacherSchedules.get(course.teacherId)!.push(scheduledClass);
            roomSchedules.get(room.id)!.push(scheduledClass);

            scheduled = true;
            break;
          }
        }
      }
    });
  });

  // Convert to output format
  const output: ScheduleOutput = {
    sectionSchedules: Array.from(sectionSchedules.entries()).map(
      ([section, schedule]) => ({
        section,
        schedule: schedule.sort((a, b) => {
          const aHour = parseInt(a.startTime.split(':')[0]);
          const bHour = parseInt(b.startTime.split(':')[0]);
          return aHour - bHour;
        }),
        breaks: breakSchedules[section]
          ? {
              recess: breakSchedules[section].recess.map((h) => ({
                startTime: `${h}:00`,
                endTime: `${h + RECESS_DURATION}:30`,
                hour: h,
              })),
              lunch: breakSchedules[section].lunch.map((h) => ({
                startTime: `${h}:00`,
                endTime: `${h + LUNCH_DURATION}:00`,
                hour: h,
              })),
            }
          : { recess: [], lunch: [] },
      })
    ),
    teacherSchedules,
    roomSchedules,
  };

  return output;
}
