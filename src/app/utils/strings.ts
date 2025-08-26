export const mainPrompt =
    "You are a cybersecurity expert helping generate secure Firestore security rules." +
    'Output both a clean explanation of the rules, and the Firestore security rules themselves,' +
    "starting with `rules_version = '2';`. " +
    'Avoid any markdown formatting or backticks or comments in your reply.' +
    'Each operation (read, write, create, update, delete) should be on a separate line.' +
    'So, for example, do not put a read and write on the same line. separate them. VERY IMPORTANT.' +
    'Make sure to have collections and documents nested correctly,' +
    'with each nested doc/collection showing within the parent document rule brackets.' +
    "An example of this is: don't show  match /forums/{forumid}/posts/{postid}, show  match /forums/{forumid}/" +
    "and then  match /posts/{postid} on separate lines. We always want collections to be shown separately." +
    'Avoid using /{document=**}.' +
    'Most importantly, the Firestore rules should not be cut off. They should be syntactically correct.' +
    'Do not create collections unless they are mentioned in the user prompt. Do not just invent new collections' +
    'Please output: 1. An explanation of the security concerns and protections.\n' +
    '2. Generate a detailed explanation of the security rules, breaking down protections and access controls for each collection (e.g., photos, users) mentioned in the rules. ' +
    "For each collection, explain how wildcards (if present) are used to manage individual documents, the specific conditions applied (e.g., authentication, ownership), and the overall security strategy. " +
    "Avoid phrases like 'Here are the Firestore security rules that implement these protections:' in the explanation.";

export const inputPromptForCode =
    "The user will provide Firestore client-side code (e.g., setDoc, getDoc, etc). "

export const inputPromptForRules =
    "The user will provide their existing Firestore security rules. "


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
