'use client';

import styles from './functions.module.css';

const functions = [
    {
        name: 'isAuthor',
        description: 'Checks if the user ID matches the document owner ID.',
        code: `function isAuthor() {
  return request.auth != null && request.auth.uid == resource.data.authorId;
}`,
    },
    {
        name: 'isAdmin',
        description: 'Checks if the user has an admin claim.',
        code: `function isAdmin() {
  return request.auth.token.admin == true;
}`,
    },
    {
        name: 'isOwner',
        description: 'Checks if the user owns the parent document.',
        code: `function isOwner() {
  return request.auth != null && request.auth.uid == resource.data.ownerId;
}`,
    },
    {
        name: 'isAuthenticated',
        description: 'Checks if the user is authenticated.',
        code: `function isAuthenticated() {
  return request.auth != null;
}`,
    },
    {
        name: 'isModerator',
        description: 'Checks if the user has a moderator role.',
        code: `function isModerator() {
  return request.auth.token.role == 'moderator';
}`,
    },
];

export default function FunctionsPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Available Firestore Functions</h1>
            <ul className={styles.functionsList}>
                {functions.map(fn => (
                    <li key={fn.name} className={styles.functionBox}>
                        <h2>{fn.name}()</h2>
                        <p className={styles.description}>{fn.description}</p>
                        <pre className={styles.code}><code>{fn.code}</code></pre>
                    </li>
                ))}
            </ul>
        </main>
    );
}
