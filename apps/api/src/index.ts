import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { runAutoLisp } from "./lispRunner.js";
import { consumeMagicToken, createMagicToken } from "./auth.js";
import { prisma } from "./db.js";
import { generateHint } from "./hints.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/magic-link/request", async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email.includes("@")) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email }
  });

  const token = createMagicToken(email);
  res.json({ sent: true, token });
});

app.post("/auth/magic-link/verify", async (req, res) => {
  const token = String(req.body?.token || "");
  const email = consumeMagicToken(token);
  if (!email) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ userId: user.id, email: user.email });
});

app.get("/lessons", async (_req, res) => {
  const lessons = await prisma.lesson.findMany({ orderBy: { createdAt: "asc" } });
  res.json(lessons);
});

app.get("/lessons/:id", async (req, res) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(lesson);
});

app.post("/lessons/:id/checkpoint", async (req, res) => {
  const userId = String(req.body?.userId || "");
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId: req.params.id } },
    update: { completed: true },
    create: { userId, lessonId: req.params.id, completed: true }
  });

  const lessonStarter = await prisma.badge.findUnique({ where: { key: "lesson-starter" } });
  if (lessonStarter) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: lessonStarter.id } },
      update: {},
      create: { userId, badgeId: lessonStarter.id }
    });
  }

  res.json(progress);
});

app.post("/runs", async (req, res) => {
  const userId = String(req.body?.userId || "");
  const lessonId = req.body?.lessonId ? String(req.body.lessonId) : undefined;
  const code = String(req.body?.code || "");
  if (!userId || !code) {
    res.status(400).json({ error: "userId and code are required" });
    return;
  }

  let expectedOutput: string | undefined;
  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    expectedOutput = lesson?.expectedOutput;
  }

  const result = runAutoLisp(code, expectedOutput);
  const run = await prisma.run.create({
    data: {
      userId,
      lessonId,
      code,
      output: result.output,
      status: result.status,
      error: result.error,
      expected: expectedOutput
    }
  });

  const firstRun = await prisma.badge.findUnique({ where: { key: "first-run" } });
  if (firstRun) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: firstRun.id } },
      update: {},
      create: { userId, badgeId: firstRun.id }
    });
  }

  res.json({
    runId: run.id,
    output: run.output,
    status: run.status,
    error: run.error,
    expected: run.expected
  });
});

app.get("/runs/:runId", async (req, res) => {
  const run = await prisma.run.findUnique({ where: { id: req.params.runId } });
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json(run);
});

app.post("/ai/hint", async (req, res) => {
  const userId = String(req.body?.userId || "");
  const question = String(req.body?.userQuestion || "");
  const code = String(req.body?.code || "");
  if (!userId || !question) {
    res.status(400).json({ error: "userId and userQuestion are required" });
    return;
  }

  const attemptCount = await prisma.run.count({ where: { userId } });

  const hint = generateHint({ question, code, attemptCount });
  res.json(hint);
});

app.get("/badges", async (req, res) => {
  const userId = String(req.query.userId || "");
  const badges = await prisma.badge.findMany({
    include: { users: userId ? { where: { userId } } : false },
    orderBy: { name: "asc" }
  });

  res.json(
    badges.map((badge) => ({
      id: badge.id,
      key: badge.key,
      name: badge.name,
      description: badge.description,
      earned: Array.isArray(badge.users) && badge.users.length > 0
    }))
  );
});

app.get("/challenges/weekly/current", async (_req, res) => {
  const challenge = await prisma.challenge.findFirst({
    where: { isCurrent: true },
    orderBy: { createdAt: "desc" }
  });
  if (!challenge) {
    res.status(404).json({ error: "No current challenge configured" });
    return;
  }
  res.json(challenge);
});

app.post("/challenges/:id/submit", async (req, res) => {
  const userId = String(req.body?.userId || "");
  const code = String(req.body?.code || "");
  if (!userId || !code) {
    res.status(400).json({ error: "userId and code are required" });
    return;
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const result = runAutoLisp(code, challenge.expectedOutput);
  const submission = await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge.id,
      userId,
      code,
      output: result.output,
      status: result.status
    }
  });

  const badge = await prisma.badge.findUnique({ where: { key: "weekly-warmer" } });
  if (badge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id }
    });
  }

  res.json({
    submissionId: submission.id,
    output: submission.output,
    status: submission.status,
    expected: challenge.expectedOutput
  });
});

app.get("/showcase", async (_req, res) => {
  const posts = await prisma.showcasePost.findMany({
    include: { likes: true, user: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(
    posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      codeSnippet: post.codeSnippet,
      author: post.user.email,
      likes: post.likes.length
    }))
  );
});

app.post("/showcase", async (req, res) => {
  const userId = String(req.body?.userId || "");
  const title = String(req.body?.title || "");
  const description = String(req.body?.description || "");
  const codeSnippet = String(req.body?.codeSnippet || "");
  if (!userId || !title || !codeSnippet) {
    res.status(400).json({ error: "userId, title and codeSnippet are required" });
    return;
  }

  const created = await prisma.showcasePost.create({
    data: { userId, title, description, codeSnippet }
  });
  res.json(created);
});

app.post("/showcase/:id/like", async (req, res) => {
  const userId = String(req.body?.userId || "");
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  try {
    const like = await prisma.showcaseLike.create({
      data: { postId: req.params.id, userId }
    });
    res.json({ liked: true, likeId: like.id });
  } catch {
    res.json({ liked: false, reason: "already-liked" });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

