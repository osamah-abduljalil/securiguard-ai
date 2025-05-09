# SecuriGuard AI

A powerful Chrome extension that uses AI to detect and protect against malicious URLs, emails, and potential security threats in real-time.

## Features

### URL Security
- Real-time URL scanning and analysis
- Risk score calculation based on multiple factors
- Warning badges for suspicious links
- Detailed security reports
- Support for URL shorteners detection

### Email Security
- Gmail integration for email analysis
- Phishing attempt detection
- Suspicious sender verification
- Email content analysis
- Security badges for emails

### User Interface
- Clean and intuitive popup interface
- Real-time security status display
- Color-coded risk indicators
- Detailed security reports
- Draggable security badges
- Toggle scanning functionality

### Security Features
- AI-powered threat detection
- Real-time scanning
- Comprehensive security analysis
- Threat intelligence integration
- Automatic updates

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "SecuriGuard AI"
3. Click "Add to Chrome"

### Development Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/securiguard-ai.git
   cd securiguard-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Chrome browser

### Available Scripts
- `npm run dev` - Start development mode with hot reloading
- `npm run build` - Build the extension for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure
```
securiguard-ai/
├── src/
│   ├── components/     # React components
│   ├── background.js   # Background script
│   ├── content.js      # Content script
│   ├── popup.js        # Popup script
│   └── popup.html      # Popup interface
├── assets/            # Static assets
├── dist/             # Build output
└── tests/            # Test files
```

### Testing
The project uses Jest and React Testing Library for testing. Run tests with:
```bash
npm test
```

### CI/CD
The project uses GitHub Actions for continuous integration and deployment:
- Automatic testing on pull requests
- Build verification
- Automatic deployment to Chrome Web Store on main branch

## Configuration

### Chrome Web Store Deployment
To deploy to Chrome Web Store, set up these secrets in your GitHub repository:
- `EXTENSION_ID`: Your Chrome extension ID
- `CLIENT_ID`: Chrome Web Store API client ID
- `CLIENT_SECRET`: Chrome Web Store API client secret
- `REFRESH_TOKEN`: Chrome Web Store API refresh token

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All security checks are performed locally
- No data is sent to external servers without user consent
- Regular security updates and patches
- Open for security audits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Jest](https://jestjs.io/)
- [Webpack](https://webpack.js.org/)

## Support

For support, please:
1. Check the [documentation](docs/)
2. Open an issue in the repository
3. Contact the maintainers

## Roadmap

- [ ] Enhanced AI detection capabilities
- [ ] Support for more email providers
- [ ] File scanning functionality
- [ ] Custom security rules
- [ ] API integration options
- [ ] Performance optimizations
- [ ] Additional language support 