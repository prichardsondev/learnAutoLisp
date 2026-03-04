import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
const tabs = ["Learn", "Challenge", "Badges", "Showcase", "AI Tutor"];
export const App = () => {
    const [tab, setTab] = useState("Learn");
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [lessons, setLessons] = useState([]);
    const [selectedLessonId, setSelectedLessonId] = useState("");
    const selectedLesson = useMemo(() => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null, [lessons, selectedLessonId]);
    const [code, setCode] = useState("");
    const [runResult, setRunResult] = useState("");
    const [challenge, setChallenge] = useState(null);
    const [challengeCode, setChallengeCode] = useState("");
    const [challengeResult, setChallengeResult] = useState("");
    const [badges, setBadges] = useState([]);
    const [showcase, setShowcase] = useState([]);
    const [postTitle, setPostTitle] = useState("");
    const [postDescription, setPostDescription] = useState("");
    const [question, setQuestion] = useState("");
    const [hintResult, setHintResult] = useState("");
    useEffect(() => {
        api.lessons().then((data) => {
            setLessons(data);
            if (data[0]) {
                setSelectedLessonId(data[0].id);
                setCode(data[0].starterCode);
            }
        });
        api.challenge().then((data) => {
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
        if (selectedLesson)
            setCode(selectedLesson.starterCode);
    }, [selectedLesson, selectedLessonId]);
    const requireSession = () => {
        if (!session)
            throw new Error("Sign in first");
        return session;
    };
    const onRequestMagicLink = async (e) => {
        e.preventDefault();
        const response = await api.requestMagicLink(email);
        setToken(response.token);
    };
    const onVerify = async (e) => {
        e.preventDefault();
        const verified = await api.verifyMagicLink(token);
        setSession(verified);
    };
    const runLesson = async () => {
        const active = requireSession();
        if (!selectedLesson)
            return;
        const result = await api.run({ userId: active.userId, lessonId: selectedLesson.id, code });
        setRunResult(result.error
            ? `Error: ${result.error}`
            : `Status: ${result.status}\nOutput: ${result.output}\nExpected: ${result.expected ?? "-"}`);
        if (result.status === "passed") {
            await api.checkpoint(selectedLesson.id, active.userId);
            setBadges(await api.badges(active.userId));
        }
    };
    const runWeeklyChallenge = async () => {
        const active = requireSession();
        if (!challenge)
            return;
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
    const publishShowcase = async (e) => {
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
    const likePost = async (postId) => {
        const active = requireSession();
        await api.likeShowcase(postId, active.userId);
        setShowcase(await api.showcase());
    };
    return (_jsxs("div", { className: "page", children: [_jsxs("header", { className: "hero", children: [_jsx("h1", { children: "Learn AutoLISP" }), _jsx("p", { children: "Practice coding, solve weekly challenges, and collect badges." })] }), _jsx("section", { className: "auth card", children: !session ? (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onRequestMagicLink, children: [_jsx("label", { children: "Email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), placeholder: "student@example.com" }), _jsx("button", { type: "submit", children: "Request Magic Link" })] }), _jsxs("form", { onSubmit: onVerify, children: [_jsx("label", { children: "Dev Token" }), _jsx("input", { value: token, onChange: (e) => setToken(e.target.value), placeholder: "paste token" }), _jsx("button", { type: "submit", children: "Sign In" })] })] })) : (_jsxs("p", { children: ["Signed in as ", session.email] })) }), _jsx("nav", { className: "tabs", children: tabs.map((value) => (_jsx("button", { className: value === tab ? "active" : "", onClick: () => setTab(value), children: value }, value))) }), tab === "Learn" && (_jsxs("section", { className: "grid", children: [_jsxs("aside", { className: "card", children: [_jsx("h2", { children: "Lessons" }), lessons.map((lesson) => (_jsx("button", { className: "list-item", onClick: () => setSelectedLessonId(lesson.id), children: lesson.title }, lesson.id)))] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: selectedLesson?.title }), _jsx("p", { children: selectedLesson?.content }), _jsx("textarea", { value: code, onChange: (e) => setCode(e.target.value), rows: 8 }), _jsx("button", { onClick: runLesson, children: "Run Lesson Code" }), _jsx("pre", { children: runResult })] })] })), tab === "Challenge" && (_jsxs("section", { className: "card", children: [_jsx("h2", { children: challenge?.title }), _jsx("p", { children: challenge?.prompt }), _jsx("textarea", { value: challengeCode, onChange: (e) => setChallengeCode(e.target.value), rows: 8 }), _jsx("button", { onClick: runWeeklyChallenge, children: "Submit Weekly Challenge" }), _jsx("pre", { children: challengeResult })] })), tab === "Badges" && (_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Badges" }), badges.map((badge) => (_jsxs("div", { className: `badge ${badge.earned ? "earned" : "locked"}`, children: [_jsx("strong", { children: badge.name }), _jsx("p", { children: badge.description })] }, badge.id)))] })), tab === "Showcase" && (_jsxs("section", { className: "grid", children: [_jsxs("article", { className: "card", children: [_jsx("h2", { children: "Publish Project" }), _jsxs("form", { onSubmit: publishShowcase, children: [_jsx("label", { children: "Title" }), _jsx("input", { value: postTitle, onChange: (e) => setPostTitle(e.target.value) }), _jsx("label", { children: "Description" }), _jsx("textarea", { value: postDescription, onChange: (e) => setPostDescription(e.target.value), rows: 3 }), _jsx("button", { type: "submit", children: "Publish" })] })] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: "Feed" }), showcase.map((post) => (_jsxs("div", { className: "post", children: [_jsx("strong", { children: post.title }), _jsx("p", { children: post.description }), _jsx("pre", { children: post.codeSnippet }), _jsxs("small", { children: ["By ", post.author] }), _jsxs("button", { onClick: () => likePost(post.id), children: ["Like (", post.likes, ")"] })] }, post.id)))] })] })), tab === "AI Tutor" && (_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Hint-First Tutor" }), _jsx("p", { children: "Ask for help; the tutor escalates guidance based on your attempts." }), _jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value), rows: 3 }), _jsx("button", { onClick: askTutor, children: "Get Hint" }), _jsx("pre", { children: hintResult })] }))] }));
};
