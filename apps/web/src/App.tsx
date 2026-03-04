import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, Lesson } from "./api";

type UserSession = {
  userId: string;
  email: string;
};

const tabs = ["Learn", "Challenge", "Badges", "Showcase", "AI Tutor"] as const;
type Tab = (typeof tabs)[number];

export const App = () => {
  const [tab, setTab] = useState<Tab>("Learn");
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState("");

  const [challenge, setChallenge] = useState<{
    id: string;
    title: string;
    prompt: string;
    starterCode: string;
    expectedOutput: string;
  } | null>(null);
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeResult, setChallengeResult] = useState("");

  const [badges, setBadges] = useState<Array<{ id: string; name: string; description: string; earned: boolean }>>([]);
  const [showcase, setShowcase] = useState<
    Array<{ id: string; title: string; description: string; codeSnippet: string; author: string; likes: number }>
  >([]);

  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [hintResult, setHintResult] = useState("");

  useEffect(() => {
    api.lessons().then((data: Lesson[]) => {
      setLessons(data);
      if (data[0]) {
        setSelectedLessonId(data[0].id);
        setCode(data[0].starterCode);
      }
    });
    api.challenge().then((data: { id: string; title: string; prompt: string; starterCode: string; expectedOutput: string }) => {
      setChallenge(data);
      setChallengeCode(data.starterCode);
    });
    api.showcase().then(setShowcase);
  }, []);

  useEffect(() => {
    if (session) {
      api.badges(session.userId).then(setBadges);
    }
  }, [session]);

  useEffect(() => {
    if (selectedLesson) setCode(selectedLesson.starterCode);
  }, [selectedLesson, selectedLessonId]);

  const requireSession = () => {
    if (!session) throw new Error("Sign in first");
    return session;
  };

  const onRequestMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    const response = await api.requestMagicLink(email);
    setToken(response.token);
  };

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    const verified = await api.verifyMagicLink(token);
    setSession(verified);
  };

  const runLesson = async () => {
    const active = requireSession();
    if (!selectedLesson) return;
    const result = await api.run({ userId: active.userId, lessonId: selectedLesson.id, code });
    setRunResult(
      result.error
        ? `Error: ${result.error}`
        : `Status: ${result.status}\nOutput: ${result.output}\nExpected: ${result.expected ?? "-"}`
    );
    if (result.status === "passed") {
      await api.checkpoint(selectedLesson.id, active.userId);
      setBadges(await api.badges(active.userId));
    }
  };

  const runWeeklyChallenge = async () => {
    const active = requireSession();
    if (!challenge) return;
    const result = await api.submitChallenge(challenge.id, {
      userId: active.userId,
      code: challengeCode
    });
    setChallengeResult(`Status: ${result.status}\nOutput: ${result.output}\nExpected: ${result.expected}`);
    setBadges(await api.badges(active.userId));
  };

  const askTutor = async () => {
    const active = requireSession();
    const result = await api.hint({
      userId: active.userId,
      userQuestion: question,
      code
    });
    setHintResult(`Hint Level ${result.hintLevel}\n${result.guidance}\nNext: ${result.nextStepPrompt}`);
  };

  const publishShowcase = async (e: FormEvent) => {
    e.preventDefault();
    const active = requireSession();
    await api.publishShowcase({
      userId: active.userId,
      title: postTitle,
      description: postDescription,
      codeSnippet: code
    });
    setPostTitle("");
    setPostDescription("");
    setShowcase(await api.showcase());
  };

  const likePost = async (postId: string) => {
    const active = requireSession();
    await api.likeShowcase(postId, active.userId);
    setShowcase(await api.showcase());
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>Learn AutoLISP</h1>
        <p>Practice coding, solve weekly challenges, and collect badges.</p>
      </header>

      <section className="auth card">
        {!session ? (
          <>
            <form onSubmit={onRequestMagicLink}>
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
              <button type="submit">Request Magic Link</button>
            </form>
            <form onSubmit={onVerify}>
              <label>Dev Token</label>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="paste token" />
              <button type="submit">Sign In</button>
            </form>
          </>
        ) : (
          <p>Signed in as {session.email}</p>
        )}
      </section>

      <nav className="tabs">
        {tabs.map((value) => (
          <button key={value} className={value === tab ? "active" : ""} onClick={() => setTab(value)}>
            {value}
          </button>
        ))}
      </nav>

      {tab === "Learn" && (
        <section className="grid">
          <aside className="card">
            <h2>Lessons</h2>
            {lessons.map((lesson) => (
              <button key={lesson.id} className="list-item" onClick={() => setSelectedLessonId(lesson.id)}>
                {lesson.title}
              </button>
            ))}
          </aside>
          <article className="card">
            <h2>{selectedLesson?.title}</h2>
            <p>{selectedLesson?.content}</p>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={8} />
            <button onClick={runLesson}>Run Lesson Code</button>
            <pre>{runResult}</pre>
          </article>
        </section>
      )}

      {tab === "Challenge" && (
        <section className="card">
          <h2>{challenge?.title}</h2>
          <p>{challenge?.prompt}</p>
          <textarea value={challengeCode} onChange={(e) => setChallengeCode(e.target.value)} rows={8} />
          <button onClick={runWeeklyChallenge}>Submit Weekly Challenge</button>
          <pre>{challengeResult}</pre>
        </section>
      )}

      {tab === "Badges" && (
        <section className="card">
          <h2>Badges</h2>
          {badges.map((badge) => (
            <div key={badge.id} className={`badge ${badge.earned ? "earned" : "locked"}`}>
              <strong>{badge.name}</strong>
              <p>{badge.description}</p>
            </div>
          ))}
        </section>
      )}

      {tab === "Showcase" && (
        <section className="grid">
          <article className="card">
            <h2>Publish Project</h2>
            <form onSubmit={publishShowcase}>
              <label>Title</label>
              <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
              <label>Description</label>
              <textarea value={postDescription} onChange={(e) => setPostDescription(e.target.value)} rows={3} />
              <button type="submit">Publish</button>
            </form>
          </article>
          <article className="card">
            <h2>Feed</h2>
            {showcase.map((post) => (
              <div key={post.id} className="post">
                <strong>{post.title}</strong>
                <p>{post.description}</p>
                <pre>{post.codeSnippet}</pre>
                <small>By {post.author}</small>
                <button onClick={() => likePost(post.id)}>Like ({post.likes})</button>
              </div>
            ))}
          </article>
        </section>
      )}

      {tab === "AI Tutor" && (
        <section className="card">
          <h2>Hint-First Tutor</h2>
          <p>Ask for help; the tutor escalates guidance based on your attempts.</p>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
          <button onClick={askTutor}>Get Hint</button>
          <pre>{hintResult}</pre>
        </section>
      )}
    </div>
  );
};

