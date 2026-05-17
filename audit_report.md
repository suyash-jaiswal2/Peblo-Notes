# Peblo Notes - Deep Audit Report

This report identifies bugs, errors, and areas for improvement in the Peblo Notes application based on code analysis and live deployment testing.

## Summary of Findings

| Priority | Issue | Category | Status |
| :--- | :--- | :--- | :--- |
| 🔴 Critical | AI Analysis 500 Error (Invalid Model) | Backend / API | Identified |
| 🟠 High | Note Deletion Unresponsiveness | UI/UX / Functional | Identified |
| 🟡 Medium | Dashboard Stats Discrepancy | Logic / API | Identified |
| 🟡 Medium | React Hydration Mismatch Warning | Technical Debt | Identified |
| 🔵 Low | Configuration Duplication | Setup | Identified |
| 🔵 Low | Note Editor Pinning Feedback | UI/UX | Identified |
| 🔵 Low | Persistent Skeleton Loaders | Performance / UX | Identified |

---

## Detailed Analysis

### 🔴 AI Analysis 500 Error
- **Location**: `lib/anthropic.ts` (Line 26)
- **Problem**: The code attempts to call an invalid model name `claude-haiku-4-5`. This results in an API error from the Anthropic SDK, which propagates as a `500 Internal Server Error` to the frontend.
- **Impact**: The "AI Analyze" feature is completely broken.

### 🟠 Note Deletion Unresponsiveness
- **Location**: `components/notes/NoteCard.tsx` (Lines 126, 41-46)
- **Problem**: Live testing showed that clicking the delete (trash) icon on a note card often fails to trigger the `confirm` dialog or the deletion logic. 
- **Possible Cause**: 
    - The hit area (28x28px) might be too small or intercepted by the parent `motion.div` hover animations.
    - `window.confirm` might be getting blocked or shadowed in certain browser environments.
- **Impact**: Users cannot delete notes reliably from the grid view.

### 🟡 Dashboard Stats Discrepancy
- **Location**: `app/api/insights/route.ts` (Lines 43, 45)
- **Problem**: The `totalNotes` and `pinnedCount` calculations filter out archived notes:
  ```typescript
  totalNotes: notes.filter((n) => !n.isArchived).length,
  pinnedCount: notes.filter((n) => n.isPinned && !n.isArchived).length,
  ```
- **Impact**: If a user only has archived notes, the dashboard shows `0` total notes, which is factually incorrect and confusing.

### 🟡 React Hydration Mismatch Warning
- **Location**: `app/layout.tsx` / Console
- **Problem**: `Warning: Extra attributes from the server: class at body`. 
- **Cause**: This usually happens when a browser extension or a client-side theme script modifies the `<body>` class before React can hydrate, or if there's a mismatch between server-rendered HTML and client-side initial state.
- **Impact**: Can lead to subtle UI bugs and slower hydration performance.

### 🔵 Configuration Duplication
- **Location**: Root directory
- **Problem**: Presence of both `next.config.mjs` and `next.config.ts`.
- **Cause**: Inconsistent project initialization. Next.js will only use one, and `next.config.ts` contains the experimental configuration while `next.config.mjs` is empty.
- **Impact**: Developer confusion and potential for misconfiguration.

### 🔵 Note Editor Pinning Feedback
- **Location**: `components/notes/NoteEditor.tsx`
- **Problem**: While the pin button state *does* update, there is no "optimistic" UI update or prominent success animation, making it feel "laggy" or unresponsive to some users.
- **Impact**: Minor UX friction.

### 🔵 Persistent Skeleton Loaders
- **Location**: `app/(workspace)/notes/page.tsx`
- **Problem**: Skeleton loaders (dark blocks) remain visible for several seconds even on fast connections.
- **Possible Cause**: The `isLoading` state in the Zustand store might be held longer than necessary or the API response is delayed by database cold starts/latency.
- **Impact**: Makes the app feel slower than it actually is.

---

## Recommended Fixes

1. **AI Model**: Change `claude-haiku-4-5` to `claude-3-5-sonnet-20240620` or `claude-3-haiku-20240307`.
2. **Deletion**: Increase the hit area for the delete button and consider a custom modal instead of `window.confirm`.
3. **Stats Logic**: Update `/api/insights` to include archived notes in the total count or label it as "Active Notes".
4. **Hydration**: Add `suppressHydrationWarning` to the `<html>` tag in `app/layout.tsx`.
5. **Config**: Delete `next.config.mjs` and consolidate settings into `next.config.ts`.
6. **Optimistic UI**: Implement optimistic updates in the Zustand store for pinning and archiving to provide instant feedback.
