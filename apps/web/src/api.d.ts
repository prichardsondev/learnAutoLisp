export type Lesson = {
    id: string;
    title: string;
    content: string;
    starterCode: string;
    expectedOutput: string;
};
export declare const api: {
    requestMagicLink: (email: string) => Promise<{
        token: string;
        sent: boolean;
    }>;
    verifyMagicLink: (token: string) => Promise<{
        userId: string;
        email: string;
    }>;
    lessons: () => Promise<Lesson[]>;
    run: (payload: {
        userId: string;
        lessonId?: string;
        code: string;
    }) => Promise<{
        output: string;
        status: string;
        error?: string;
        expected?: string;
        runId: string;
    }>;
    checkpoint: (lessonId: string, userId: string) => Promise<unknown>;
    badges: (userId: string) => Promise<{
        id: string;
        name: string;
        description: string;
        earned: boolean;
    }[]>;
    challenge: () => Promise<{
        id: string;
        title: string;
        prompt: string;
        starterCode: string;
        expectedOutput: string;
    }>;
    submitChallenge: (challengeId: string, payload: {
        userId: string;
        code: string;
    }) => Promise<{
        output: string;
        status: string;
        expected: string;
    }>;
    hint: (payload: {
        userId: string;
        userQuestion: string;
        code: string;
    }) => Promise<{
        hintLevel: number;
        guidance: string;
        nextStepPrompt: string;
    }>;
    showcase: () => Promise<{
        id: string;
        title: string;
        description: string;
        codeSnippet: string;
        author: string;
        likes: number;
    }[]>;
    publishShowcase: (payload: {
        userId: string;
        title: string;
        description: string;
        codeSnippet: string;
    }) => Promise<unknown>;
    likeShowcase: (postId: string, userId: string) => Promise<{
        liked: boolean;
        reason?: string;
    }>;
};
