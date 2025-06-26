'use client';

import styles from './bestPractices.module.css';

export default function BestPracticesPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Firestore Security Rules — Best Practices</h1>

      <ul className={styles.list}>
        <li>
          <strong>1. Always check authentication:</strong>
          <p>
            Use <span className={styles.code}>request.auth != null</span> to ensure the user is logged in.
          </p>
        </li>
        <li>
          <strong>2. Validate user ownership:</strong>
          <p>
            Match userId in the path to <span className={styles.code}>request.auth.uid</span> for read/write access.
          </p>
        </li>
        <li>
          <strong>3. Limit document access by role:</strong>
          <p>
            Implement role-based logic like <span className={styles.code}>isAdmin()</span> or <span className={styles.code}>isModerator()</span> where needed.
          </p>
        </li>
        <li>
          <strong>4. Use strict schema validation:</strong>
          <p>
            Define a <span className={styles.code}>function schema()</span> and validate input types and structures.
          </p>
        </li>
        <li>
          <strong>5. Prevent unauthorized writes:</strong>
          <p>
            Validate that incoming data does not override protected fields or inject unexpected keys using
            <span className={styles.code}>request.resource.data.keys().hasOnly([...])</span>.
          </p>
        </li>
        <li>
          <strong>6. Avoid write if document doesn’t exist:</strong>
          <p>
            Use <span className={styles.code}>!exists(/databases/...</span> to avoid creating data unintentionally.
          </p>
        </li>
        <li>
          <strong>7. Use wildcards and scoping carefully:</strong>
          <p>
            Always scope rules tightly. Avoid broad wildcards like <span className={styles.code}>match /{'{document}'}</span> unless explicitly needed.
          </p>
        </li>
      </ul>

      <div className={styles.linkBox}>
        <a href="https://firebase.google.com/docs/rules/basics" target="_blank" rel="noopener noreferrer">
          🔗 Firebase Docs – Firestore Rules Best Practices
        </a>
      </div>
    </main>
  );
}
