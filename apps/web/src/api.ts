const API_BASE = "http://localhost:4000";

export type Lesson = {
  id: string;
  title: string;
  content: string;
  starterCode: string;
  expectedOutput: string;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export const api = {
  requestMagicLink: (email: string) =>
    request<{ token: string; sent: boolean }>("/auth/magic-link/request", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  verifyMagicLink: (token: string) =>
    request<{ userId: string; email: string }>("/auth/magic-link/verify", {
      method: "POST",
      body: JSON.stringify({ token })
    }),
  lessons: () => request<Lesson[]>("/lessons"),
  run: (payload: { userId: string; lessonId?: string; code: string }) =>
    request<{ output: string; status: string; error?: string; expected?: string; runId: string }>("/runs", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  checkpoint: (lessonId: string, userId: string) =>
    request(`/lessons/${lessonId}/checkpoint`, {
      method: "POST",
      body: JSON.stringify({ userId })
    }),
  badges: (userId: string) =>
    request<Array<{ id: string; name: string; description: string; earned: boolean }>>(
      `/badges?userId=${encodeURIComponent(userId)}`
    ),
  challenge: () =>
    request<{ id: string; title: string; prompt: string; starterCode: string; expectedOutput: string }>(
      "/challenges/weekly/current"
    ),
  submitChallenge: (challengeId: string, payload: { userId: string; code: string }) =>
    request<{ output: string; status: string; expected: string }>(`/challenges/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  hint: (payload: { userId: string; userQuestion: string; code: string }) =>
    request<{ hintLevel: number; guidance: string; nextStepPrompt: string }>("/ai/hint", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  showcase: () =>
    request<Array<{ id: string; title: string; description: string; codeSnippet: string; author: string; likes: number }>>(
      "/showcase"
    ),
  publishShowcase: (payload: { userId: string; title: string; description: string; codeSnippet: string }) =>
    request("/showcase", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  likeShowcase: (postId: string, userId: string) =>
    request<{ liked: boolean; reason?: string }>(`/showcase/${postId}/like`, {
      method: "POST",
      body: JSON.stringify({ userId })
    })
};
