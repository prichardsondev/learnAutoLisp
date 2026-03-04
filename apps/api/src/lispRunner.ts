type Atom = number | string;
type LispExpr = Atom | LispExpr[];

type Env = Map<string, unknown>;

const tokenize = (input: string): string[] => {
  return input
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

const atom = (token: string): Atom => {
  const asNumber = Number(token);
  if (!Number.isNaN(asNumber)) return asNumber;
  return token;
};

const readFromTokens = (tokens: string[]): LispExpr => {
  if (tokens.length === 0) {
    throw new Error("Unexpected EOF while reading expression");
  }
  const token = tokens.shift()!;
  if (token === "(") {
    const list: LispExpr[] = [];
    while (tokens[0] !== ")") {
      if (!tokens.length) throw new Error("Missing ')'");
      list.push(readFromTokens(tokens));
    }
    tokens.shift();
    return list;
  }
  if (token === ")") throw new Error("Unexpected ')'");
  return atom(token);
};

const parse = (code: string): LispExpr => {
  const tokens = tokenize(code);
  const expr = readFromTokens(tokens);
  if (tokens.length) throw new Error("Unexpected tokens after expression");
  return expr;
};

const toTruthy = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
};

const ensureList = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) throw new Error("Expected list");
  return value;
};

const builtins: Record<string, (...args: unknown[]) => unknown> = {
  "+": (...args) => args.reduce((acc, x) => Number(acc) + Number(x), 0),
  "-": (...args) => {
    if (args.length === 0) throw new Error("'-' requires args");
    if (args.length === 1) return -Number(args[0]);
    return args.slice(1).reduce((acc, x) => Number(acc) - Number(x), Number(args[0]));
  },
  "*": (...args) => args.reduce((acc, x) => Number(acc) * Number(x), 1),
  "/": (...args) => {
    if (args.length < 2) throw new Error("'/' requires at least 2 args");
    return args.slice(1).reduce((acc, x) => Number(acc) / Number(x), Number(args[0]));
  },
  "list": (...args) => args,
  "car": (x) => ensureList(x)[0],
  "cdr": (x) => ensureList(x).slice(1),
  "=": (a, b) => (Number(a) === Number(b) ? 1 : 0),
  ">": (a, b) => (Number(a) > Number(b) ? 1 : 0),
  "<": (a, b) => (Number(a) < Number(b) ? 1 : 0)
};

const evaluate = (expr: LispExpr, env: Env): unknown => {
  if (typeof expr === "number") return expr;
  if (typeof expr === "string") {
    if (env.has(expr)) return env.get(expr);
    return expr;
  }
  if (expr.length === 0) return [];

  const head = expr[0];
  if (head === "if") {
    const [, cond, thenExpr, elseExpr] = expr;
    const condResult = evaluate(cond, env);
    return toTruthy(condResult) ? evaluate(thenExpr, env) : evaluate(elseExpr, env);
  }

  if (head === "setq") {
    const [, name, valueExpr] = expr;
    if (typeof name !== "string") throw new Error("setq variable name must be a symbol");
    const value = evaluate(valueExpr, env);
    env.set(name, value);
    return value;
  }

  if (head === "defun") {
    const [, name, argList, body] = expr;
    if (typeof name !== "string") throw new Error("defun name must be a symbol");
    if (!Array.isArray(argList)) throw new Error("defun args must be a list");
    const fn = (...args: unknown[]) => {
      const fnEnv = new Map(env);
      argList.forEach((arg, index) => {
        if (typeof arg !== "string") throw new Error("function arg must be symbol");
        fnEnv.set(arg, args[index]);
      });
      return evaluate(body, fnEnv);
    };
    env.set(name, fn);
    return name;
  }

  const op = evaluate(head, env);
  const args = expr.slice(1).map((x) => evaluate(x, env));

  if (typeof op === "function") {
    return (op as (...fnArgs: unknown[]) => unknown)(...args);
  }
  if (typeof head === "string" && builtins[head]) {
    return builtins[head](...args);
  }
  throw new Error(`Unknown operation: ${String(head)}`);
};

export type RunResult = {
  output: string;
  status: "passed" | "failed";
  error?: string;
};

export const runAutoLisp = (code: string, expectedOutput?: string): RunResult => {
  try {
    if (code.length > 5000) throw new Error("Code payload too large");
    const env: Env = new Map(Object.entries(builtins));
    const parsed = parse(code);
    const value = evaluate(parsed, env);
    const output = Array.isArray(value) ? `(${value.join(" ")})` : String(value);
    const passed = expectedOutput ? output === expectedOutput : true;
    return {
      output,
      status: passed ? "passed" : "failed"
    };
  } catch (error) {
    return {
      output: "",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown runtime error"
    };
  }
};
