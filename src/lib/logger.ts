type LoggerConfig = {
    flow: string;
    correlationId?: string;
};

type LogMeta = Record<string, unknown> | undefined;

const levelToEmoji: Record<string, string> = {
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
    debug: "🔍",
    step: "👉",
    ok: "✅",
};

const toSingleLine = (input: unknown): unknown => {
    if (typeof input === 'string') return input;
    try {
        return JSON.stringify(input);
    } catch {
        return input;
    }
}

export const createLogger = (config: LoggerConfig) => {
    const base = {
        flow: config.flow,
        correlationId: config.correlationId,
    };

    const log = (level: keyof typeof levelToEmoji, step: string, message?: string, meta?: LogMeta) => {
        const prefix = `${levelToEmoji[level]}  [${base.flow}]${base.correlationId ? `(${base.correlationId})` : ''}`;
        const line = message ? `${prefix} · ${step} · ${message}` : `${prefix} · ${step}`;
        if (meta) {
            console.log(line, { meta });
        } else {
            console.log(line);
        }
    };

    return {
        info: (step: string, message?: string, meta?: LogMeta) => log('info', step, message, meta),
        warn: (step: string, message?: string, meta?: LogMeta) => log('warn', step, message, meta),
        error: (step: string, message?: string, meta?: LogMeta) => log('error', step, message, meta),
        debug: (step: string, message?: string, meta?: LogMeta) => log('debug', step, message, meta),
        step: (step: string, meta?: LogMeta) => log('step', step, undefined, meta),
        ok: (step: string, message?: string, meta?: LogMeta) => log('ok', step, message, meta),

        child: (more: Partial<LoggerConfig>) => createLogger({
            flow: more.flow ?? base.flow,
            correlationId: more.correlationId ?? base.correlationId,
        }),
    };
};

export const redact = (value: unknown, placeholder: string = '[REDACTED]') => {
    if (!value) return value;
    if (typeof value === 'string') return placeholder;
    return placeholder;
};


