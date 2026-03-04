import { BADGES, LESSONS } from "./seedData.js";
import { prisma } from "./db.js";

const seed = async () => {
  for (const lesson of LESSONS) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        content: lesson.content,
        starterCode: lesson.starterCode,
        expectedOutput: lesson.expectedOutput
      },
      create: lesson
    });
  }

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        description: badge.description
      },
      create: badge
    });
  }

  const current = await prisma.challenge.findFirst({ where: { isCurrent: true } });
  if (!current) {
    await prisma.challenge.create({
      data: {
        title: "Weekly #1: Simple Area Helper",
        prompt: "Write an expression that multiplies width 7 by height 3.",
        starterCode: "(* 7 3)",
        expectedOutput: "21",
        isCurrent: true
      }
    });
  }
};

seed()
  .then(async () => {
    console.log("Seed complete");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

