# School frontend

Next.js (App Router, TypeScript) frontend for the `schoolManagement_Backend` Express API.
Tailwind CSS v4, Framer Motion, Lucide icons. Light theme is Warm Ivory and Royal Navy, dark theme is Midnight Obsidian and Burnished Gold.

## Run it

```bash
npm install
cp .env.example .env.local  
npm run dev                    
```

Start the backend first (`npm run dev` in `schoolManagement_Backend`, default port 5000).

All browser requests go to `/api/*` on this app and `next.config.ts` proxies them to `BACKEND_URL`.
The login cookie therefore lives on the frontend origin and you do not need to touch CORS or `APP_URL`.

The very first admin account is not created by the app (the backend only has registration requests).
Insert one admin row in the database, or seed it, then sign in at `/login`.

## Screens

| Area | Routes |
|---|---|
| Public | `/` home (notice board, head teacher message, gallery), `/login`, `/register` |
| Admin | `/admin`, `requests`, `classes`, `subjects`, `students`, `teachers`, `notices`, `content`, `gallery` |
| Teacher | `/teacher`, `assignments`, `assignments/[id]` (submissions and grading), `exams`, `exams/[examId]` (marks, publish, promotion), `attendance` (class head only) |
| Student | `/student`, `assignments`, `assignments/[id]` (PDF upload), `results`, `attendance`, `notifications` (student and parent view), `teachers` |
| Everyone | `/profile` |

Teacher menus follow `GET /api/teacher/overview`: subject-only teachers do not see Attendance, and only class heads see exam creation, publishing and promotion.

## Structure

```
src/
  app/                     routes (one folder per screen, role layouts wrap each area)
  components/
    layout/                role shell, sidebar, theme toggle, teacher/student context
    providers/             theme, auth
    ui/                    buttons, forms, modal/drawer, tabs, toasts, progress, badges
    admin/ teacher/ auth/  feature components
  hooks/use-fetch.ts       small GET hook with reload
  lib/                     api client, types, formatting, nav config
middleware.ts              redirects signed-out visitors away from dashboards
```

Theme colors live in one place: the CSS variables at the top of `src/app/globals.css`.
The school name and time zone come from `NEXT_PUBLIC_SCHOOL_NAME` and `NEXT_PUBLIC_TIMEZONE`.

## Backend notes

Found while reading the backend. The frontend works around them where it can.

1. **Profile update fails for most users.** `updateProfileIntoDb` uses `profile: { update: ... }`, but approved users get no profile row.
   Change it to an upsert in `src/module/public/public.service.ts`:
   ```ts
   profile: { upsert: { create: { profilePhoto, bio }, update: { profilePhoto, bio } } },
   ```
   Until then, saving on `/profile` shows "The requested record was not found".

2. **Class heads can only create assignments for subjects assigned to them.** `/teacher/overview` lists only subjects where the teacher is the subject teacher.
   Optional fix, add to `src/module/teacher/teacher.route.ts`:
   ```ts
   router.get("/subjects", catchAsync(async (req, res) => {
     const ctx = await getTeacherContext(req.user!.id);
     const data = await prisma.subject.findMany({
       where: { OR: [{ id: { in: ctx.subjectIds } }, ...(ctx.headOfClassIds.length ? [{ classId: { in: ctx.headOfClassIds } }] : [])] },
       select: { id: true, name: true, class: { select: { id: true, name: true } } },
       orderBy: [{ classId: "asc" }, { name: "asc" }],
     });
     sendResponse(res, { success: true, statusCode: 200, message: "Subjects fetched successfully", data });
   }));
   ```
   Then set `NEXT_PUBLIC_TEACHER_SUBJECTS_ENDPOINT=true` in `.env.local`.

3. **`GET /admin/all-class` does not return the class head or next class.** The classes screen reads the head from `/admin/all-teachers`, but the current next class cannot be shown, only set or cleared.
   Adding `classTeacher` and `nextClass` to the `select` in `getAllClassInDb` would let it show both.

4. **Auth errors come back as HTTP 500** (the auth middleware throws a plain `Error`). The frontend therefore decides "signed out" from `GET /me` failing, not from a 401.
5. `GET /admin/all-class` and `GET /admin/content` are public in the backend. The home page and registration form use them on purpose.
# School-Management-System
