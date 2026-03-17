# Contributing to Cloudflare Zero Trust Remote Control

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cf-remote.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push and create a Pull Request

## Development Setup

```bash
cd cf-remote
npm install
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use Prettier for formatting (runs automatically)
- Ensure ESLint passes: `npm run lint`

## Testing

Before submitting:
- Test on mobile devices or mobile viewport
- Verify all touch targets are ≥48x48px
- Test dark mode appearance
- Ensure API calls work correctly

## Pull Request Process

1. Update README.md if needed
2. Update DEPLOYMENT.md for deployment changes
3. Add yourself to contributors if you'd like
4. Describe your changes clearly in the PR
5. Link any related issues

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use case and benefits
- Mockups if applicable

## Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if relevant
- Browser/device information

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing! 🚀
