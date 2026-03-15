---
name: job-app-assistant
description: Generates tailored cover letters, application intros, and tech stack alignment summaries. Use when the user needs to apply for a specific job from their JobRadar dashboard.
---

# Job Application Assistant

This skill helps you generate highly tailored application materials using your `data/profile.md` and a specific job description.

## Workflow

1. **Identify the Job**: Retrieve the job details (title, company, description) from the database or provided context.
2. **Read Profile**: Load the user's latest CV and skills from `data/profile.md`.
3. **Analyze Alignment**:
    - Identify specific tech stack overlaps (e.g., "Both use NestJS and TypeScript").
    - Note relevant projects from the profile that match the job's industry or responsibilities.
    - Highlight German relocation support or EMEA/UTC compatibility if applicable.
4. **Generate Output**:
    - **Short Intro**: A 2-3 sentence punchy intro for emails or LinkedIn.
    - **Cover Letter**: A professional, tailored cover letter focusing on "Why Me" and "Why Them".
    - **Tech Summary**: A bulleted list showing exactly how the user's skills meet the job requirements.

## Guidelines

- **Tone**: Professional, confident, and direct. Avoid generic corporate jargon.
- **Startups**: Focus on agility, ownership, and rapid scaling if the company is a startup.
- **Germany**: If the job is in Germany, explicitly mention the user's awareness of the new immigration laws (Blue Card/Chancenkarte) and their 9+ years of experience.
- **Efficiency**: Keep the generated text concise and ready to paste.
