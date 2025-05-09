# SecuriGuard AI Development Guide

This guide provides information for developers who want to contribute to or modify SecuriGuard AI.

## Development Environment Setup

### Prerequisites

1. **Required Software**
   - Node.js (v18 or higher)
   - npm (v8 or higher)
   - Google Chrome (latest version)
   - Git

2. **Development Tools**
   - Code editor (VS Code recommended)
   - Chrome DevTools
   - Git client

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/securiguard-ai.git
   cd securiguard-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Build**
   ```bash
   npm run dev
   ```

4. **Load Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Project Structure

```
securiguard-ai/
├── src/
│   ├── components/          # React components
│   │   ├── SecurityBadge/   # Security badge component
│   │   ├── Popup/          # Popup interface
│   │   └── Reports/        # Report components
│   ├── background.js       # Background script
│   ├── content.js          # Content script
│   ├── popup.js            # Popup script
│   └── popup.html          # Popup interface
├── assets/                 # Static assets
├── dist/                   # Build output
├── tests/                  # Test files
├── webpack.config.js       # Webpack configuration
└── package.json           # Project configuration
```

## Development Workflow

### 1. Code Style

- Follow the existing code style
- Use ESLint for JavaScript
- Use Prettier for formatting
- Write meaningful commit messages

### 2. Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Component Tests**
   ```bash
   npm run test:components
   ```

3. **Integration Tests**
   ```bash
   npm run test:integration
   ```

### 3. Building

1. **Development Build**
   ```bash
   npm run dev
   ```

2. **Production Build**
   ```bash
   npm run build
   ```

## Contributing

### 1. Fork and Clone

1. Fork the repository
2. Clone your fork
3. Add upstream remote
4. Create a feature branch

### 2. Development Process

1. **Setup**
   ```bash
   git checkout -b feature/your-feature
   npm install
   ```

2. **Development**
   - Make your changes
   - Write tests
   - Update documentation
   - Test thoroughly

3. **Testing**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

### 3. Pull Request

1. Push your changes
   ```bash
   git push origin feature/your-feature
   ```

2. Create a Pull Request
   - Clear description
   - Link related issues
   - Include test results
   - Update documentation

## Code Guidelines

### JavaScript

1. **Style**
   - Use ES6+ features
   - Follow Airbnb style guide
   - Use meaningful variable names
   - Add JSDoc comments

2. **React Components**
   - Functional components
   - Hooks for state
   - PropTypes validation
   - Memoization when needed

### Testing

1. **Unit Tests**
   - Jest for testing
   - React Testing Library
   - Mock external dependencies
   - Test edge cases

2. **Component Tests**
   - Test user interactions
   - Verify state changes
   - Check accessibility
   - Test error handling

## Debugging

### 1. Chrome DevTools

1. **Background Script**
   - Open `chrome://extensions`
   - Find SecuriGuard AI
   - Click "background page"

2. **Content Script**
   - Open DevTools on any page
   - Look for "Content Scripts"

3. **Popup**
   - Right-click extension icon
   - Click "Inspect popup"

### 2. Logging

1. **Console Logs**
   ```javascript
   console.log('Debug:', data);
   ```

2. **Error Handling**
   ```javascript
   try {
     // Code
   } catch (error) {
     console.error('Error:', error);
   }
   ```

## Deployment

### 1. Version Control

1. **Semantic Versioning**
   - MAJOR.MINOR.PATCH
   - Update package.json
   - Update manifest.json

2. **Changelog**
   - Update CHANGELOG.md
   - List all changes
   - Link to issues

### 2. Chrome Web Store

1. **Build**
   ```bash
   npm run build
   ```

2. **Package**
   - Create ZIP file
   - Include all assets
   - Verify manifest

3. **Upload**
   - Go to Chrome Web Store
   - Upload new version
   - Add release notes
   - Submit for review

## Security

### 1. Code Security

1. **Best Practices**
   - Input validation
   - XSS prevention
   - CSRF protection
   - Secure storage

2. **Dependencies**
   - Regular updates
   - Security audits
   - Vulnerability checks
   - License compliance

### 2. Testing Security

1. **Security Tests**
   - Penetration testing
   - Vulnerability scanning
   - Code analysis
   - Dependency checks

2. **Compliance**
   - Privacy policy
   - Data handling
   - User consent
   - GDPR compliance

## Support

### 1. Documentation

1. **Code Documentation**
   - JSDoc comments
   - README updates
   - API documentation
   - Usage examples

2. **User Documentation**
   - User guides
   - FAQ updates
   - Tutorial videos
   - Knowledge base

### 2. Community

1. **Contributing**
   - Code reviews
   - Bug reports
   - Feature requests
   - Documentation

2. **Support**
   - Issue tracking
   - Pull requests
   - Discussions
   - Chat support 