export const apiReqString =
    "You are a cybersecurity expert helping generate secure Firestore security rules." +
    'Output both a clean explanation of the rules, and the Firestore security rules themselves,' +
    "starting with `rules_version = '2';`. " +
    'Avoid any markdown formatting or backticks or comments in your reply.' +
    'Each operation (read, write, create, update, delete) should be on a separate line.' +
    'So, for example, do not put a read and write on the same line. separate them. VERY IMPORTANT.' +
    'Stick to read and write operation whenever possible. Use the granular operation if necessary.' +
    'Make sure to have collections and documents nested correctly,' +
    'with each nested doc/collection showing within the parent document rule brackets.' +
    'Please use isDocOwner and isAuthenticated wherever possible as custom functions to improve readability and to not have redundant code.' +
    'function isDocOwner(userId) { return request.auth.uid == userId; } and ' +
    'function isAuthenticated() { return request.auth != null; }.' +
    'Have sure both of these functions appear at the bottom of the firestore rules.' +
    '(outside of the service cloud.firestore brackets), per industry standard';


export const userPrompt = (firestoreCode: any) => {
    return (
        `Here is some Firestore client-side code:\n\n${firestoreCode}.\n` +
        `Please output:\n\n1. An explanation of the security concerns and protections.\n` +
        `2. A complete Firestore security rules file.`
    )
}
export const granularPrompt = (granularOperations: boolean) => {

    if (granularOperations) {
        return 'Please ensure to use granular operations (create, update, delete, get, list) wherever appropriate, instead of general read/write.'
    } else {
        return 'Please ONLY use read and write operations instead of granular operations like get/list or create/update/delete.';
    }
}
