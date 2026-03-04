export type LessonSeed = {
  slug: string;
  title: string;
  content: string;
  starterCode: string;
  expectedOutput: string;
};

export const LESSONS: LessonSeed[] = [
  {
    slug: "intro-arithmetic",
    title: "Arithmetic Basics",
    content: "Use (+ a b) and (* a b) to compute values.",
    starterCode: "(+ 2 3)",
    expectedOutput: "5"
  },
  {
    slug: "conditions",
    title: "Conditionals",
    content: "Use (if condition then else). Non-zero values are truthy.",
    starterCode: "(if 1 10 20)",
    expectedOutput: "10"
  },
  {
    slug: "lists",
    title: "Lists",
    content: "Use (list ...), (car ...), and (cdr ...).",
    starterCode: "(car (list 9 8 7))",
    expectedOutput: "9"
  }
];

export const BADGES = [
  {
    key: "first-run",
    name: "First Run",
    description: "Completed your first code run."
  },
  {
    key: "lesson-starter",
    name: "Lesson Starter",
    description: "Completed one lesson checkpoint."
  },
  {
    key: "weekly-warmer",
    name: "Weekly Warmer",
    description: "Submitted to the weekly challenge."
  }
];
