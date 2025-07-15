'use client';

import styles from './functions.module.css';

const functions = [
    {
        name: 'isOwner',
        description: 'Checks if the user ID matches the document owner ID.',
        code: `function isOwner(userId) {\n  return request.auth.uid == userId;\n}`,
    },
    {
        name: 'isAuthenticated',
        description: 'Checks if the user is authenticated.',
        code: `function isAuthenticated() {\n  return request.auth != null;\n}`,
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
