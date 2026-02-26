# School Schedule Pro

An intelligent web application that automatically generates school schedules based on student enrollments, teacher availability, courses, and room constraints.

## Features

- 🔐 **Google Sign-In Integration** with Supabase Authentication
- 📊 **Excel & Google Sheets Support** for data import
- 🎯 **Smart Scheduling Algorithm** with constraint handling:
  - No more than 2 consecutive classes for students and teachers
  - Staggered recess (30 minutes) and lunch breaks (1 hour)
  - School hours: 7 AM - 3 PM
  - Room availability management
- 📱 **Responsive UI** built with Next.js and Tailwind CSS
- 💾 **Secure Data Handling** with Supabase backend

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Authentication:** Supabase Auth (Google OAuth)
- **File Processing:** XLSX (Excel), Lucide Icons
- **Styling:** Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Project (for OAuth)

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard:
   - Navigate to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google OAuth credentials
3. Note your project URL and Anon Key from **Project Settings** → **API**

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Create an OAuth 2.0 Client ID (Web application):
   - Authorized JavaScript origins: http://localhost:3000 and your production domain
   - Authorized redirect URIs: http://localhost:3000/auth/callback and your production callback URL
6. Copy your Client ID and Client Secret

### 3. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Excel File Format

The application requires an Excel file with these sheets:

### Students Sheet

| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique student identifier |
| Name | String | Student name |
| Section | String | Class section (e.g., "10-A", "10-B") |
| Courses | String | Comma-separated course IDs |

### Courses Sheet

| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique course identifier |
| Name | String | Course name |
| TeacherID | String | Assigned teacher's ID |
| Duration | Number | Course duration in hours |

### Teachers Sheet

| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique teacher identifier |
| Name | String | Teacher name |
| Courses | String | Comma-separated course IDs they teach |

### Rooms Sheet

| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique room identifier |
| Name | String | Room name/number |
| Type | String | Room type: normal, lab, or specialized |
| Capacity | Number | Room capacity |

## Scheduling Algorithm

The algorithm ensures:

1. **No consecutive overload:** Max 2 consecutive classes per student/teacher
2. **Break times:** Staggered recess and lunch breaks across sections
3. **Resource optimization:** Efficient room and teacher allocation
4. **Constraint satisfaction:** Respects all room and teacher assignments

### Time Slots
- School starts at 7:00 AM
- School ends at 3:00 PM (8 hours total)
- Each class slot is 1 hour
- Breaks: Recess (30 min ~11AM) and Lunch (1 hour ~1PM), staggered by section

## Project Structure

```
scheduler-pro/
├── app/
│   ├── api/
│   │   ├── schedule/route.ts
│   │   └── auth/
│   │       ├── google/route.ts
│   │       └── callback/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── file-upload.tsx
│   ├── schedule-display.tsx
│   └── auth-button.tsx
├── lib/
│   ├── scheduler.ts
│   ├── parser.ts
│   ├── supabase.ts
│   └── auth-context.tsx
├── .env.local
└── package.json
```

## Development

```bash
# Build for production
npm run build
npm start

# Run linting
npm run lint
```

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## License

MIT License
