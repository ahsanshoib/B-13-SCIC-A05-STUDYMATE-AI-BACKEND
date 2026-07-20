export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Economics",
  "Statistics",
  "English Literature",
  "History",
  "Psychology",
  "Accounting",
  "Electrical Engineering",
] as const;

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export const RESOURCE_SORT_OPTIONS = [
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "time_asc",
  "time_desc",
] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type ResourceSort = (typeof RESOURCE_SORT_OPTIONS)[number];