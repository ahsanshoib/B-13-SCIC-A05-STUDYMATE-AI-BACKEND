export const SUBJECTS = [

  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Industrial & Production Engineering (IPE)",
  "Architecture",
  "Geology",
  "Environmental Science",
  "Medicine",
  "Dentistry",
  "Pharmacy",
  "Nursing",
  "Biotechnology",
  "Microbiology",
  "Biochemistry",
  "Agriculture",
  "Veterinary Science",
  "Business Administration",
  "Finance",
  "Marketing",
  "Management",
  "International Business",
  "Law",
  "Political Science",
  "International Relations",
  "Sociology",
  "Anthropology",
  "Public Administration",
  "Development Studies",
  "Criminology",
  "Bengali",
  "Philosophy",
  "Linguistics",
  "Islamic Studies",
  "Religious Studies",
  "Fine Arts",
  "Graphic Design",
  "Music",
  "Dance",
  "Theatre",
  "Film & Television",
  "Journalism",
  "Media Studies",
  "Fisheries",
  "Forestry",
  "Food Science",
  "Textile Engineering",
  "Tourism",
  "Sports Science",

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