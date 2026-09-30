# Journal/todo with AI

A personal journal and task manager that runs in the browser, with a clean Evernote-style design. It was built with the help of AI (Claude Code).

## What it does

- **Home**: a dashboard with a greeting, your recent journal entries, the next tasks to do, and a mood overview.
- **Journal**: write entries in a two-pane editor that saves as you type. Each entry can record a mood, an energy level, what you're grateful for, and tags. You can search and filter entries by mood or tag. A 14-day mood chart and a writing streak show how you've been doing.
- **Tasks**: add tasks with a priority, a due date and a tag. Open tasks are grouped into Overdue, Today, Tomorrow, Upcoming and No date. You can filter by status, due date, priority or tag, search, and sort. Completed tasks move to their own faded section, and deleting a task can be undone.
- **Itinerary**: a Monday–Sunday plan of your week, shown as a calendar grid (6 AM–8 PM) or as a list. Each activity has a start and end time, a color, an optional note, and repeats on the days you pick (e.g. Mon/Wed/Fri). The week repeats until you edit or delete something, and deleting can be undone. Overlapping activities sit side by side, free time between activities is labelled, and a line marks the current time. Click an empty slot in the grid to add an activity there. On phones the grid shows one day at a time.
- **Light and dark themes**: switch themes from the sidebar, or set it to follow your system.
- **Responsive**: full sidebar on desktop, an icon strip on tablets, and a slide-out menu on phones.

All data is stored in your browser (`localStorage`). There is no account or server, and nothing leaves your device.

## Tech stack

React 18, React Router 6, Vite 4, plain CSS with design tokens.

## Getting started

Requires Node.js 16 or newer.

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
npm run build    # production build in dist/
```

## Project structure

```
src/
  pages/        Home, Journal, Tasks and Itinerary pages
  components/   Sidebar, menus and shared UI; journal/, todo/ and itinerary/ hold each feature's pieces
  lib/          date, mood, entry, task and itinerary helpers
  styles/       design tokens, base styles, and one stylesheet per area
  store.jsx     shared app data (entries, tasks, itinerary, undo)
  theme.js      light/dark theme handling
```
