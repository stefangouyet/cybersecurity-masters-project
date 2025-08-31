# Firestore Rules Toolkit

A prototype web-based toolkit for analyzing, generating, and visualizing Firebase Firestore security rules, developed as part of a Master’s dissertation for the MSc in Computer Forensics and Cyber Security at the University of Greenwich.

## Project Title

**A Toolkit for Testing and Generating Firestore Security Rules Using AI and Static Code Analysis**  
University of Greenwich — MSc Dissertation  
Author: Stefan Gouyet (Student ID: 001415471)  
Supervisor: Dr. Sadiq Sani

## Project Overview

This project introduces an educational and practical tool for understanding and improving Firebase Firestore security rules.

Key features:
- **Static analysis** of `.rules` files with insecure pattern detection
- **GPT-4 integration** for AI-assisted rule generation from code, natural language, or existing rules
- **Dual-pane GUI editor** with live sync between code and visual rule tree
- Emphasis on **secure defaults** and **least privilege**
- Simulated role-based evaluation (unauthenticated/authenticated/admin)

## Project Structure

/app/ # Next.js pages for Input, Rules Editor, etc.
/api/ # API routes for AI generation, parsing
/components/ # Reusable components (input fields, editors, modals)
/public/ # Static assets
README.md
package.json

markdown

## Technologies Used

- [Next.js](https://nextjs.org/) — Frontend + API routing
- [React](https://reactjs.org/) — UI components
- [Redux](https://redux.js.org/) — Global state management
- [OpenAI API (GPT-4)](https://platform.openai.com/) — Rule generation and explanation
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [CSS Modules] — Scoped styling

## Getting Started

### Prerequisites
- Node.js >= 18
- OpenAI API Key (for GPT-4 access)

### Installation
git clone https://github.com/your-username/firestore-rules-toolkit.git
cd firestore-rules-toolkit
yarn

### Development Server
yarn dev
Navigate to http://localhost:3000 in your browser.

Environment Variables
Create a .env.local file:
env
OPENAI_API_KEY=[insert_private_api_key_here]