type HintLevel = 1 | 2 | 3 | 4;

export const generateHint = (input: {
  question: string;
  code: string;
  attemptCount: number;
}): { hintLevel: HintLevel; guidance: string; nextStepPrompt: string } => {
  const level: HintLevel =
    input.attemptCount >= 6 ? 4 : input.attemptCount >= 4 ? 3 : input.attemptCount >= 2 ? 2 : 1;

  if (/full|answer|solution/i.test(input.question) && level < 4) {
    return {
      hintLevel: level,
      guidance: "I cannot provide full solutions yet. Start by breaking the expression into smaller pieces.",
      nextStepPrompt: "What operation should happen first in your expression?"
    };
  }

  if (level === 1) {
    return {
      hintLevel: 1,
      guidance: "Focus on the core AutoLISP form for this task and verify argument order.",
      nextStepPrompt: "Try one minimal expression and run it."
    };
  }
  if (level === 2) {
    return {
      hintLevel: 2,
      guidance: "Use a two-step plan: compute intermediate value, then produce final output.",
      nextStepPrompt: "Can you write the first step as a valid list expression?"
    };
  }
  if (level === 3) {
    return {
      hintLevel: 3,
      guidance: "Check for missing parentheses and confirm each function receives the right number of arguments.",
      nextStepPrompt: "Run your code and compare the output with expected output."
    };
  }
  return {
    hintLevel: 4,
    guidance: "Partial worked example: set one variable, then apply your target operation on it.",
    nextStepPrompt: "Adapt that structure to the numbers in your prompt."
  };
};
