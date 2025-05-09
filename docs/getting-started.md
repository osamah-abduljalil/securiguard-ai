# Getting Started with SecuriGuard AI

This guide will help you get up and running with SecuriGuard AI quickly.

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "SecuriGuard AI"
3. Click "Add to Chrome"
4. Confirm the installation when prompted

### Manual Installation (Development)

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
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `dist` directory from the project

## First-time Setup

1. **Initial Configuration**
   - Click the SecuriGuard AI icon in your Chrome toolbar
   - Review and accept the privacy policy
   - Choose your preferred security level:
     - Basic: Essential security checks
     - Standard: Comprehensive security analysis
     - Advanced: Maximum security with detailed reporting

2. **Email Integration (Optional)**
   - Click "Connect Email" in the popup
   - Follow the authentication process
   - Select which email features to enable:
     - Phishing detection
     - Sender verification
     - Content analysis

3. **Custom Settings**
   - Access settings through the popup menu
   - Configure notification preferences
   - Set up custom security rules
   - Choose your preferred language

## Basic Usage

1. **URL Scanning**
   - The extension automatically scans URLs as you browse
   - Look for the security badge in the address bar
   - Click the badge for detailed security information

2. **Email Protection**
   - Open your Gmail account
   - The extension will scan incoming emails
   - Security badges appear next to suspicious emails

3. **Security Reports**
   - Click the extension icon to view the dashboard
   - Check the "Recent Scans" section
   - View detailed reports for any scanned item

## Next Steps

- Read the [User Guide](./user-guide.md) for detailed usage instructions
- Check out the [Features](./features.md) page to learn about all capabilities
- Visit the [Troubleshooting](./troubleshooting.md) guide if you encounter any issues

## System Requirements

- Google Chrome version 88 or higher
- Windows 10/11, macOS 10.15+, or Linux
- Internet connection for real-time scanning
- 100MB of free disk space

## Privacy and Security

- All security checks are performed locally when possible
- No personal data is collected without consent
- See our [Security](./security.md) documentation for details 