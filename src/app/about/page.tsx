'use client';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <main className={styles.wrapper}>
            <h1 className={styles.title}>About This Project</h1>

            <p className={styles.paragraph}>
                This project was developed for my Master’s degree in Computer Forensics and Cyber Security at the University of Greenwich.
            </p>

            <p className={styles.paragraph}>
                The tool is designed to accelerate and improve the process of developing Firebase/Firestore Security Rules. By combining a visual interface with AI assistance, it aims to make secure rule creation easier and more accessible.
            </p>

            <p className={styles.paragraph}>Features include:</p>
            <ul className={styles.list}>
                <li>AI-generated security rules using OpenAI API.</li>
                <li>Least-privilege rule generation.</li>
                <li>Visual editor to review and tighten conditions per collection/document.</li>
                <li>Explanation of rules in plain English. </li>
            </ul>

            <p className={styles.paragraph}>
                This work reflects my interest in cloud and database security.
            </p>

            <p className={styles.signature}>
                — Stefan Gouyet<br />
                MSc Computer Forensics and Cyber Security<br />
                University of Greenwich
            </p>
        </main>
    );
}
