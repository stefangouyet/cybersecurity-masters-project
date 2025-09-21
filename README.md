# Firestore Security Rules Toolkit

A web-based toolkit for **designing, testing, and visualizing Firebase Firestore security rules**, created as part of an MSc dissertation in *Computer Forensics and Cyber Security* at the University of Greenwich.

## Project Title
**A Toolkit for Designing Firestore Security Rules Using Generative AI and Interactive Rule Validation**  
University of Greenwich — Master's Project, Computer Forensics and Cyber Security  

Author: Stefan Gouyet

Supervisor: Dr. Sadiq Sani

## Overview

This project provides both an **educational platform** and a **practical toolkit** for exploring the design and security of Firestore security rules.  
It combines AI-driven rule generation with interactive validation, enabling developers to better understand and avoid common misconfigurations.

### Core Features
- **AI-Assisted Rule Generation**  
  Uses OpenAI GPT-4 to generate security rules from:
  - Firestore client code  
  - Existing `.rules` files  
  - Plain-English text descriptions
- **Dual-pane Rule Builder**  
  Synchronizes a visual rule tree editor with the raw Firestore security rules code view.
- **Granular Operations Support**  
  Toggle between broad `read`/`write` rules and fine-grained `get`, `list`, `create`, `update`, `delete`.
- **Custom Function Helpers**  
  Abstracts repetitive checks like `isAuthenticated()` and `isDocOwner(userId)` for clarity and reuse.
- **Misconfiguration Detection**  
  Identifies insecure patterns (e.g., `allow read, write: if true;`) and flags them for correction.
- **Explanations for Learning**  
  Each generated ruleset is paired with a natural-language explanation of its logic.

## Project Structure

/app/ — Next.js app router pages (Home, Rules Editor, etc.)  
/app/api/ — API routes (e.g. /api/generate-firestore-rules)  
/app/components/ — Shared React components (CodeView, RuleEditor, Modals)  
/store/ — Redux slices and hooks for state management  
/public/ — Static assets  
README.md  
package.json  

## Technologies

- [Next.js](https://nextjs.org/) — React framework + API routes  
- [React](https://reactjs.org/) — Component-based UI  
- [Redux Toolkit](https://redux-toolkit.js.org/) — Global state management  
- [OpenAI API (GPT-4)](https://platform.openai.com/docs/api-reference/introduction) — AI rule generation & explanations  
- [TypeScript](https://www.typescriptlang.org/) — Type safety  
- [CSS Modules](https://github.com/css-modules/css-modules) — Scoped styling  
- [Material UI](https://mui.com/) — UI components  

## Getting Started

### Prerequisites
- Node.js 18+  
- Yarn or npm  
- OpenAI API key with GPT-4 access  

### Installation
```bash
cd firestore-rules-toolkit
yarn
yarn dev
Navigate to http://localhost:3000 in your browser.

Environment Variables
Create a .env.local file at the root of the project:
OPENAI_API_KEY=your_api_key_here
```

### Academic Context
This toolkit was developed as part of a Master’s dissertation.
It explores how generative AI can assist in secure rule design, while providing an interactive interface for learning and validation.

### Disclaimer
This project is intended for educational and research purposes.
Generated rules should always be manually reviewed and tested before use in production.
