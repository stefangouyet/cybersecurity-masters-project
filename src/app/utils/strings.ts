export const mainPrompt =
    "You are a cybersecurity expert generating secure Firestore security rules. " +
    "Always output exactly two parts in this order:\n" +
    "1. The final Firestore Security Rules, starting with `rules_version = '2';`.\n" +
    "2. A concise explanation of what the new rules are accomplishing" +
    "Keep the explanation short, direct, and free of filler.\n" +
    "Apply the Principle of Least Privilege:\n" +
    "- Default deny; grant only the minimum operations that are clearly implied by the input (code/schema/rules).\n" +
    "- Scope every match to the narrowest possible path; rarely use /{document=**} or overly broad matches.\n" +
    "- Require authentication unless the input explicitly calls for public access.\n" +
    "- Require role-based access control as is necessary to apply the principle of least-privilege.\n" +
    "Keep the explanation short, direct, and free of filler.\n" +
    "\n" +
    "Rules requirements:\n" +
    "- Do not use markdown formatting, backticks, or comments in the rules.\n" +
    "- Put each operation (read, write, create, update, delete) on its own line.\n" +
    "- Nest collections and documents correctly; do not combine them in one match line.\n" +
    "- Example: use `match /forums/{forumId}/` then inside `match /posts/{postId}` (never a single combined match).\n" +
    "- Avoid /{document=**} patterns.\n" +
    "- Do not invent collections that are not implied by the user input.\n" +
    "Most importantly, the rules must be syntactically correct and secure. " +
    "Use `isAuthenticated()` and `isDocOwner(userId)` when appropriate to avoid duplication and enforce access control.";


export const inputPromptForCode =
    "The user will provide Firestore client-side code (e.g., setDoc, getDoc, etc). "

export const inputPromptForRules =
    "The user will provide their existing Firestore security rules. " +
    "Analyze them, then output corrected and secure rules first. " +
    "In the explanation, concisely state why the original rules were insecure (e.g., allow true, missing authentication, overly broad matches, missing ownership checks) and how the corrected rules fix those issues. " +
    "Keep the explanation short and to the point.";


export const inputPromptForText =
    "The user will provide a description of their Firestore database schema and data access needs."

export const granularPrompt = (granularOperations: boolean) => {
    if (granularOperations) {
        return 'Please ensure to use granular operations (create, update, delete, get, list) wherever appropriate, instead of general read/write.'
    } else {
        return 'Please ONLY use READ and WRITE operations instead of granular operations like get/list or create/update/delete.';
    }
}
export const customFunctionPrompt = (useCustomFunctions: boolean) => {
    if (useCustomFunctions) {
        return (
            'Use `isDocOwner(userId)` and `isAuthenticated()` as custom functions when referenced in conditions to avoid duplication. ' +
            'Definitions:\n' +
            'function isDocOwner(userId) { return request.auth.uid == userId; }\n' +
            'function isAuthenticated() { return request.auth != null; }\n' +
            'If either function name is used in the rules, include its function definition within the `service cloud.firestore` block.'
        );
    } else {
        return 'Do not use any custom functions (e.g., isAuthenticated, isDocOwner).';
    }
};
