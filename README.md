# SecuriGuard AI - Smart Security Advisor Extension

SecuriGuard AI is a browser extension that provides real-time security analysis and protection while browsing, reading emails, or downloading files. It combines AI-powered analysis with threat intelligence to keep users safe online.

## Features

- **URL Safety Checker**: Real-time scanning of URLs with AI-powered phishing detection
- **Email Security Scanner**: Integration with webmail services for phishing detection
- **File Scanner**: Pre-download analysis of files for malware detection
- **Real-Time Threat Intelligence**: Integration with multiple security databases
- **AI-Powered Risk Scoring**: Comprehensive security analysis with visual feedback
- **User Guidance**: Contextual security recommendations and education
- **Privacy-First Design**: Minimal data collection with local processing

## Installation

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
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project folder

## Development

- Run development build with watch mode:
```bash
npm run dev
```

- Run tests:
```bash
npm test
```

## Tech Stack

- Frontend: React + Manifest V3
- AI Models: OpenAI API, TensorFlow.js
- Threat Intelligence: VirusTotal, Google Safe Browsing
- Storage: IndexedDB (local), Firebase (optional)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

If you discover any security-related issues, please email security@securiguard.ai instead of using the issue tracker. 