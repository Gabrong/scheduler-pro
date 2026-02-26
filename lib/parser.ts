import * as XLSX from 'xlsx';
import {
  Student,
  Course,
  Teacher,
  Room,
} from './scheduler';

export interface ParsedData {
  students: Student[];
  courses: Map<string, Course>;
  teachers: Map<string, Teacher>;
  rooms: Room[];
}

/**
 * Parse students sheet
 * Expected columns: ID, Name, Section, Courses (comma-separated course IDs)
 */
export function parseStudents(worksheet: XLSX.WorkSheet): Student[] {
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data.map((row: any) => ({
    id: row.ID?.toString() || '',
    name: row.Name || '',
    section: row.Section || '',
    courses: row.Courses ? row.Courses.split(',').map((c: string) => c.trim()) : [],
  }));
}

/**
 * Parse courses sheet
 * Expected columns: ID, Name, TeacherID, Duration
 */
export function parseCourses(worksheet: XLSX.WorkSheet): Map<string, Course> {
  const data = XLSX.utils.sheet_to_json(worksheet);
  const coursesMap = new Map<string, Course>();

  data.forEach((row: any) => {
    const course: Course = {
      id: row.ID?.toString() || '',
      name: row.Name || '',
      teacherId: row.TeacherID?.toString() || '',
      duration: parseInt(row.Duration) || 1,
    };
    if (course.id) {
      coursesMap.set(course.id, course);
    }
  });

  return coursesMap;
}

/**
 * Parse teachers sheet
 * Expected columns: ID, Name, Courses (comma-separated course IDs)
 */
export function parseTeachers(worksheet: XLSX.WorkSheet): Map<string, Teacher> {
  const data = XLSX.utils.sheet_to_json(worksheet);
  const teachersMap = new Map<string, Teacher>();

  data.forEach((row: any) => {
    const teacher: Teacher = {
      id: row.ID?.toString() || '',
      name: row.Name || '',
      courses: row.Courses ? row.Courses.split(',').map((c: string) => c.trim()) : [],
    };
    if (teacher.id) {
      teachersMap.set(teacher.id, teacher);
    }
  });

  return teachersMap;
}

/**
 * Parse rooms sheet
 * Expected columns: ID, Name, Type (normal/lab/specialized), Capacity
 */
export function parseRooms(worksheet: XLSX.WorkSheet): Room[] {
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row: any) => {
    const roomType = (row.Type || 'normal').toLowerCase();
    return {
      id: row.ID?.toString() || '',
      name: row.Name || '',
      type: roomType === 'lab' || roomType === 'lab' || roomType === 'specialized' 
        ? roomType as 'normal' | 'lab' | 'specialized'
        : 'normal',
      capacity: parseInt(row.Capacity) || 50,
    };
  });
}

/**
 * Parse Excel file containing all sheets
 */
export function parseExcelFile(fileBuffer: ArrayBuffer): ParsedData {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });

  const students = parseStudents(workbook.Sheets['Students'] || workbook.Sheets[workbook.SheetNames[0]]);
  const courses = parseCourses(workbook.Sheets['Courses'] || workbook.Sheets[workbook.SheetNames[1]]);
  const teachers = parseTeachers(workbook.Sheets['Teachers'] || workbook.Sheets[workbook.SheetNames[2]]);
  const rooms = parseRooms(workbook.Sheets['Rooms'] || workbook.Sheets[workbook.SheetNames[3]]);

  return {
    students,
    courses,
    teachers,
    rooms,
  };
}

/**
 * Fetch and parse Google Sheets data
 * Requires public Google Sheets link
 */
export async function parseGoogleSheets(sheetId: string, apiKey: string): Promise<ParsedData> {
  const ranges = ['Students', 'Courses', 'Teachers', 'Rooms'];
  
  const students: Student[] = [];
  const coursesMap = new Map<string, Course>();
  const teachersMap = new Map<string, Teacher>();
  let rooms: Room[] = [];

  for (const range of ranges) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values || data.values.length === 0) continue;

      const headers = data.values[0];
      const rows = data.values.slice(1);

      if (range === 'Students') {
        rows.forEach((row: any[]) => {
          students.push({
            id: row[0]?.toString() || '',
            name: row[1] || '',
            section: row[2] || '',
            courses: row[3] ? row[3].split(',').map((c: string) => c.trim()) : [],
          });
        });
      } else if (range === 'Courses') {
        rows.forEach((row: any[]) => {
          const course: Course = {
            id: row[0]?.toString() || '',
            name: row[1] || '',
            teacherId: row[2]?.toString() || '',
            duration: parseInt(row[3]) || 1,
          };
          if (course.id) coursesMap.set(course.id, course);
        });
      } else if (range === 'Teachers') {
        rows.forEach((row: any[]) => {
          const teacher: Teacher = {
            id: row[0]?.toString() || '',
            name: row[1] || '',
            courses: row[2] ? row[2].split(',').map((c: string) => c.trim()) : [],
          };
          if (teacher.id) teachersMap.set(teacher.id, teacher);
        });
      } else if (range === 'Rooms') {
        rows.forEach((row: any[]) => {
          const roomType = (row[2] || 'normal').toLowerCase();
          rooms.push({
            id: row[0]?.toString() || '',
            name: row[1] || '',
            type: roomType === 'lab' || roomType === 'specialized' 
              ? roomType as 'normal' | 'lab' | 'specialized'
              : 'normal',
            capacity: parseInt(row[3]) || 50,
          });
        });
      }
    } catch (error) {
      console.error(`Error fetching ${range} sheet:`, error);
    }
  }

  return {
    students,
    courses: coursesMap,
    teachers: teachersMap,
    rooms,
  };
}
