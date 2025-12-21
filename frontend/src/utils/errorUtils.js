/**
 * Sanitizes and formats error messages for display.
 * @param {string} error - The raw error message string.
 * @returns {string} - A user-friendly error message.
 */
export const sanitizeErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred.';

    const errString = String(error);

    // Gemini / Google Quota Exceeded (429)
    if (errString.includes('429') && (errString.includes('quota') || errString.includes('rate limit'))) {
        return 'Rate limit exceeded. You have used up your free tier quota for this model. Please try again later or switch to a different model.';
    }

    // OpenRouter / General 429
    if (errString.includes('429')) {
        return 'Too many requests. Please slow down and try again later.';
    }

    // Authentication Errors (401/403)
    if (errString.includes('401') || errString.includes('403') || errString.toLowerCase().includes('unauthorized') || errString.toLowerCase().includes('invalid api key')) {
        return 'Authentication failed. Please check your API key in Settings.';
    }

    // Ollama Model Not Found
    if (errString.includes('Error calling Ollama') && errString.includes('404') && errString.includes('not found')) {
        const modelMatch = errString.match(/model "([^"]+)" not found/);
        const modelName = modelMatch ? modelMatch[1] : 'the selected model';
        return `Local model not found. Please run 'ollama pull ${modelName}' in your terminal to download it.`;
    }

    // Backend Internal Error (AsyncMessageStreamManager)
    if (errString.includes('AsyncMessageStreamManager') && errString.includes('context manager protocol')) {
        return 'Internal Backend Error: Streaming configuration issue. Please check backend logs or try disabling streaming.';
    }

    // Not Found (404)
    if (errString.includes('404')) {
        return 'The requested resource or model was not found. It may be temporarily unavailable.';
    }

    // Connection Errors
    if (errString.toLowerCase().includes('connection refused') || errString.toLowerCase().includes('network error') || errString.toLowerCase().includes('failed to fetch')) {
        return 'Unable to connect to the server. Please ensure the backend is running.';
    }

    // Overloaded / 503
    if (errString.includes('503') || errString.toLowerCase().includes('overloaded')) {
        return 'The service is currently overloaded. Please try again in a moment.';
    }

    // Clean up verbose JSON dumps or stack traces if they slip through
    if (errString.includes('{') && errString.includes('}')) {
        // Try to extract a "message" field if it looks like JSON
        try {
            const match = errString.match(/"message":\s*"([^"]+)"/);
            if (match && match[1]) {
                return match[1];
            }
        } catch (e) {
            // ignore
        }
        // If it's a really long raw dump, truncate it
        if (errString.length > 200) {
            return 'An unexpected error occurred. Check the console for details.';
        }
    }

    return errString;
};
