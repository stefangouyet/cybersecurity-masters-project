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
                <li>AI-generated security rules from Firestore code or plain English.</li>
                <li>Visual editor for managing read/write conditions.</li>
                <li>Support for granular operations and reusable custom functions.</li>
            </ul>

            <p className={styles.paragraph}>
                This work reflects my interest in cloud security and developer tooling. Thank you for using the tool.
            </p>

            <p className={styles.signature}>
                — Stefan Gouyet<br />
                MSc Computer Forensics and Cyber Security<br />
                University of Greenwich
            </p>
        </main>
    );
}
