import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/lib/parser';
import { generateSchedule } from '@/lib/scheduler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const buffer = await file.arrayBuffer();

    // Parse Excel file
    const parsedData = parseExcelFile(buffer);

    // Generate schedule
    const schedule = generateSchedule(
      parsedData.students,
      parsedData.courses,
      parsedData.teachers,
      parsedData.rooms
    );

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error processing schedule:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
