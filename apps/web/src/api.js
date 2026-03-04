const API_BASE = "http://localhost:4000";
const request = async (path, init) => {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }
    return (await res.json());
};
export const api = {
    requestMagicLink: (email) => request("/auth/magic-link/request", {
        method: "POST",
        body: JSON.stringify({ email })
    }),
    verifyMagicLink: (token) => request("/auth/magic-link/verify", {
        method: "POST",
        body: JSON.stringify({ token })
    }),
    lessons: () => request("/lessons"),
    run: (payload) => request("/runs", {
        method: "POST",
        body: JSON.stringify(payload)
    }),
    checkpoint: (lessonId, userId) => request(`/lessons/${lessonId}/checkpoint`, {
        method: "POST",
        body: JSON.stringify({ userId })
    }),
    badges: (userId) => request(`/badges?userId=${encodeURIComponent(userId)}`),
    challenge: () => request("/challenges/weekly/current"),
    submitChallenge: (challengeId, payload) => request(`/challenges/${challengeId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload)
    }),
    hint: (payload) => request("/ai/hint", {
        method: "POST",
        body: JSON.stringify(payload)
    }),
    showcase: () => request("/showcase"),
    publishShowcase: (payload) => request("/showcase", {
        method: "POST",
        body: JSON.stringify(payload)
    }),
    likeShowcase: (postId, userId) => request(`/showcase/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId })
    })
};
