# 🤖 CIARA-IV MINI WhatsApp Bot

**Advanced WhatsApp Bot with AI Chat, Song/Video Download & Customer Care**

Created by **CraigeeX** - A 19-year-old Self-taught Developer from Zimbabwe

---

## 📋 Table of Contents

- [Features](#-features)
- [Commands List](#-commands-list)
- [Setup & Deployment](#-setup--deployment)
- [Getting API Keys](#-getting-api-keys)
- [Usage Examples](#-usage-examples)
- [Security Features](#-security-features)
- [Bot Status & Monitoring](#-bot-status--monitoring)
- [Customization](#-customization)
- [Support & Contact](#-support--contact)
- [Quick Start](#-quick-start)

---

## ✨ Features

### 🎵 Media Download
- **Song Download**: `.song [song name]` - Download songs in Audio or Document format
- **Video Download**: `.video [video name]` - Download videos in Audio or Document format
- **Format Selection**: Interactive menu with Audio/Document options
- **YouTube Integration**: Powered by ytdl-core and yt-search

### 🤖 AI Integration  
- **Gemini AI Chat**: `.ciara [question]` - Ask questions to Google's Gemini AI
- **Intelligent Responses**: Context-aware AI conversations
- **Natural Language**: Human-like interaction capabilities
- **Error Recovery**: Graceful handling of API failures

### 📞 Support System
- **Customer Care**: `.care [problem]` - Forward issues directly to CraigeeX
- **Developer Contact**: `.dev` - Get creator's contact information with vCard
- **Bot Status**: `.alive` - Check bot health and uptime
- **Owner Notifications**: Real-time alerts for important events

### 🛠️ Management & Control
- **Menu Display**: `.menu` - Show command menu with bot photo
- **Block Users**: `.block [number]` - Owner-only user blocking system
- **About Info**: `.about` - Detailed bot and creator information (hidden command)
- **Rate Limiting**: Anti-spam protection (20 messages/minute)

### 🔥 Special Features
- **MEGA Session Support**: Session format `CIARA-IV~xxxxxxxxx`
- **Always Online Status**: Maintains online presence 24/7
- **Auto Voice Recording**: Shows recording status during responses
- **Owner Privileges**: Special commands for bot owner
- **Multi-platform**: Works in groups and private chats
- **Auto-reconnection**: Handles disconnections gracefully

---

## 🚀 Commands List

| Command | Access Level | Description | Usage Example |
|---------|-------------|-------------|---------------|
| `.menu` | Everyone | Display command menu with image | `.menu` |
| `.dev` | Everyone | Get creator contact information | `.dev` |
| `.song` | Everyone | Download songs | `.song Shape of You` |
| `.video` | Everyone | Download videos | `.video Despacito` |
| `.ciara` | Everyone | Ask AI questions | `.ciara What is AI?` |
| `.alive` | Everyone | Check bot status | `.alive` |
| `.care` | Everyone | Customer support | `.care Bot not working` |
| `.block` | Owner Only | Block user | `.block 1234567890` |
| `.about` | Everyone | Bot & creator info (Hidden) | `.about` |

---

## 🔧 Setup & Deployment

### Prerequisites
- Node.js 16+ installed
- Gemini AI API Key ([Get here](https://makersuite.google.com/app/apikey))
- MEGA account for session storage
- Render account for deployment

### Environment Variables
```bash
SESSION_ID=CIARA-IV~your_mega_session_id_here
GEMINI_API_KEY=your_gemini_api_key_here
OWNER_NUMBER=27847826044
PORT=3000
```

### 💻 Local Installation
```bash
# Clone the repository
git clone https://github.com/CraigeeX/ciara-iv-mini.git
cd ciara-iv-mini

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start the bot
npm start
```

### 🌐 Render Deployment (Recommended)

#### Method 1: Using Render Dashboard

1. **Create Account**: Sign up at [Render.com](https://render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select this repository

3. **Configure Settings**:
   - **Name**: `ciara-iv-mini-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Environment Variables**: Add these in Render dashboard:
   ```
   SESSION_ID=CIARA-IV~your_mega_session_id_here
   GEMINI_API_KEY=your_gemini_api_key_here
   OWNER_NUMBER=27847826044
   NODE_ENV=production
   ```

5. **Deploy**: Click "Create Web Service"

6. **Monitor Deployment**: Check logs for QR code (first run) or connection status

#### Method 2: Using render.yaml (One-Click Deploy)

1. Fork this repository
2. Click the deploy button below
3. Configure environment variables
4. Deploy automatically

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### 🐳 Docker Deployment

```bash
# Build the image
docker build -t ciara-iv-mini .

# Run the container
docker run -d \
  -e SESSION_ID=CIARA-IV~your_session_id \
  -e GEMINI_API_KEY=your_api_key \
  -e OWNER_NUMBER=27847826044 \
  -p 3000:3000 \
  --name ciara-bot \
  ciara-iv-mini
```

---

## 📱 Getting API Keys

### 🔑 Gemini AI API Key

1. **Visit Google AI Studio**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Create API Key**: Click "Create API Key"
4. **Select Project**: Choose existing or create new project
5. **Copy Key**: Save the generated API key securely
6. **Set Environment**: Add to your `.env` file as `GEMINI_API_KEY`

### 💾 MEGA Session Storage

**First Time Setup (No Session)**:
1. Leave `SESSION_ID` empty in environment variables
2. Deploy the bot
3. Check logs for QR code
4. Scan QR code with WhatsApp
5. Bot will auto-generate and upload session to MEGA
6. Copy the `CIARA-IV~` session ID from logs
7. Update environment variables with the session ID

**Using Existing Session**:
1. Use your existing `CIARA-IV~xxxxxxxxx` session ID
2. Bot will download and use the session automatically
3. No QR code scanning required

---

## 🎯 Usage Examples

### 🎵 Song Download Flow
```
User: .song Shape of You

Bot: 🔍 Searching for: Shape of You
     Please wait...

Bot: 🎵 Found: Ed Sheeran - Shape of You (Official Music Video)
     Duration: 3:53
     
     Song Format:
     1. Audio
     2. Document
     
     Reply with 1 or 2

User: 1

Bot: 🎵 Downloading audio...
     [Sends MP3 file]
```

### 📹 Video Download Flow
```
User: .video Despacito

Bot: 🔍 Searching for video: Despacito
     Please wait...

Bot: 📹 Found: Luis Fonsi - Despacito ft. Daddy Yankee
     Duration: 4:41
     
     Video Format:
     1. Audio (MP3)
     2. Document (MP4)
     
     Reply with 1 or 2

User: 2

Bot: 📹 Downloading video...
     [Sends MP4 file as document]
```

### 🤖 AI Chat Flow
```
User: .ciara What is artificial intelligence?

Bot: 🤖 Thinking about your question...

Bot: Artificial intelligence (AI) is a branch of computer science 
     that focuses on creating systems capable of performing tasks 
     that typically require human intelligence. These tasks include:
     
     • Learning and adapting
     • Problem-solving
     • Pattern recognition
     • Decision making
     • Natural language processing
     
     AI systems like me use machine learning algorithms to process 
     information and provide helpful responses. Is there a specific 
     aspect of AI you'd like to know more about?

User: .ciara How do you work?

Bot: 🤖 Thinking about your question...

Bot: Great question! As CIARA-IV MINI, I work through several components:
     
     🧠 **AI Brain**: I use Google's Gemini AI to understand and 
     respond to your questions intelligently.
     
     📱 **WhatsApp Integration**: I connect to WhatsApp using 
     Baileys library, allowing me to send and receive messages.
     
     🎵 **Media Processing**: For songs and videos, I search 
     YouTube and download content using specialized tools.
     
     ☁️ **Cloud Storage**: My session data is stored securely 
     on MEGA cloud to maintain connections.
     
     Created with love by CraigeeX, a 19-year-old developer 
     from Zimbabwe! 🇿🇼
```

### 🆘 Customer Care Flow
```
User: .care My bot is not responding to commands properly

Bot: 🆘 Your support request has been forwarded to CraigeeX!
     
     Request ID: #1701234567890
     
     You'll receive a response soon. Thank you for your patience! 😊

[Bot forwards to CraigeeX:]
🆘 Customer Care Request #1701234567890

👤 User: John Doe
📱 Number: +1234567890@s.whatsapp.net  
❓ Problem: My bot is not responding to commands properly
🕐 Time: 2024-01-15 14:30:25

Please respond to help this user!
```

### 📞 Developer Contact Flow
```
User: .dev

Bot: 🛠️ I was created by CraigeeX!
     
     Here's his contact information:

Bot: [Sends contact card with:]
     Name: CraigeeX
     Organization: CIARA
     Title: Bot Creator & Developer  
     Phone: +27847826044
     GitHub: https://github.com/CraigeeX
     Note: Creator of CIARA-IV MINI WhatsApp Bot - 
           19 years old Self-taught Developer from Zimbabwe
```

### 📊 Bot Status Check
```
User: .alive

Bot: 🤖 CIARA-IV MINI Status

     ✅ Bot is alive and running!
     ⏰ Uptime: 2h 34m
     🔗 Connection: Online
     👨‍💻 Creator: CraigeeX
     📊 Status: All systems operational
     🧠 AI Engine: Gemini Pro
     💾 Session: MEGA Cloud Storage
     🌍 Server: Render.com
```

---

## 🛡️ Security Features

### 🔒 Access Control
- **Owner Privileges**: Special commands only for bot creator
- **User Blocking**: Ability to block problematic users permanently
- **Rate Limiting**: Prevents spam with 20 messages per minute limit
- **Command Validation**: Proper input sanitization and validation

### 🛡️ Data Protection
- **Session Encryption**: Secure MEGA session storage
- **Environment Variables**: Sensitive data stored securely
- **No Local Storage**: Session data stored in cloud only
- **Auto Cleanup**: Temporary files automatically removed

### ⚠️ Error Handling
- **API Failures**: Graceful handling of external API errors
- **Network Issues**: Auto-reconnection on connection loss
- **Invalid Inputs**: User-friendly error messages
- **Resource Management**: Proper cleanup of resources

### 📊 Usage Monitoring
- **Rate Limiting**: Tracks user message frequency
- **Owner Notifications**: Alerts for important events
- **Error Logging**: Comprehensive error tracking
- **Health Monitoring**: Regular system health checks

---

## 📊 Bot Status & Monitoring

### 🔍 Health Check System
The bot includes a built-in health check endpoint at `/` that provides:

```json
{
  "status": "healthy",
  "bot": "CIARA-IV MINI", 
  "creator": "CraigeeX",
  "uptime": 7234.5,
  "timestamp": "2024-01-15T12:30:45.123Z",
  "version": "1.0.0"
}
```

### 📈 Monitoring Features
- **Real-time Uptime**: Live uptime tracking and display
- **Connection Status**: Monitors WhatsApp connection health
- **Auto-reconnection**: Handles disconnects automatically
- **Owner Alerts**: Notifications for critical events
- **Performance Tracking**: Monitors response times and errors

### 🔄 Always Online Features
- **Online Presence**: Maintains WhatsApp online status 24/7
- **Presence Updates**: Regular status updates every 30 seconds
- **Auto Voice Recording**: Shows recording indicator during responses
- **Quick Responses**: Fast command processing and replies

### 📱 Status Commands
Users can check bot status using:
- `.alive` - Full status report with uptime
- `.menu` - Verify bot responsiveness
- Any command - Bot responds if online

---

## 🔧 Customization

### ➕ Adding New Commands

Add new commands in the `handleCommand` function:

```javascript
case '.newcommand':
    if (args.length === 0) {
        await sock.sendMessage(chatId, { 
            text: `Please provide arguments for this command!` 
        });
        return true;
    }
    
    const userInput = args.join(' ');
    await sock.sendMessage(chatId, { 
        text: `You said: ${userInput}` 
    });
    break;
```

### 🤖 Modifying AI Responses

Customize the Gemini AI behavior in the `getGeminiResponse` function:

```javascript
const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiApiKey}`,
    {
        contents: [{
            parts: [{
                text: `You are CIARA-IV MINI, a helpful assistant created by CraigeeX. 
                       Always be friendly and include emojis in responses.
                       User ${userName} asks: ${question}
                       
                       Respond in a conversational, helpful way.`
            }]
        }]
    }
);
```

### 🎵 Adding New Download Sources

Extend the download functionality:

```javascript
// Add new search function
const searchSpotify = async (query) => {
    // Spotify search implementation
};

// Add to command handler
case '.spotify':
    const spotifyResult = await searchSpotify(args.join(' '));
    // Handle Spotify download
    break;
```

### 🎨 Customizing Menu Design

Modify the menu display in the `.menu` command:

```javascript
case '.menu':
    const customMenuText = `🎨 *Custom Bot Menu*
    
    🔥 *Premium Commands*
    • .premium - Premium features
    • .vip - VIP user benefits
    
    📊 *Analytics*  
    • .stats - Bot statistics
    • .usage - Usage reports
    
    🛠️ *Created by CraigeeX*
    📧 your.custom.email@gmail.com`;
    
    await sock.sendMessage(chatId, {
        image: Buffer.from(menuImage.data),
        caption: customMenuText
    });
    break;
```

### ⚙️ Configuration Options

Customize bot behavior through the config object:

```javascript
const config = {
    // Bot settings
    prefix: '.', // Change command prefix
    responseDelay: 1000, // Response delay in ms
    rateLimitMax: 30, // Max messages per minute
    
    // AI settings
    geminiModel: 'gemini-pro', // AI model to use
    maxTokens: 1000, // Max response length
    
    // Download settings
    audioQuality: 'highestaudio',
    videoQuality: 'highest',
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
    
    // Customize responses
    responses: {
        blocked: "🚫 You have been blocked from using this bot.",
        rateLimit: "⏰ Please slow down! Wait before sending more messages.",
        error: "❌ Something went wrong. Please try again later."
    }
};
```

---

## 📞 Support & Contact

### 👨‍💻 Creator Information
- **Name**: CraigeeX  
- **Age**: 19 years old
- **Background**: Self-taught Developer from Zimbabwe 🇿🇼
- **Specialization**: WhatsApp Bots, AI Integration, Web Development

### 📱 Contact Methods
- **Email**: [ciara.info.inc@gmail.com](mailto:ciara.info.inc@gmail.com)
- **WhatsApp**: [+27847826044](https://wa.me/27847826044)
- **GitHub**: [CraigeeX](https://github.com/CraigeeX)
- **Location**: Zimbabwe, Africa

### 🆘 Getting Help

**For Bot Issues**:
1. Use `.care [your problem]` command in the bot
2. Email directly: ciara.info.inc@gmail.com  
3. WhatsApp: +27847826044

**For Technical Support**:
- Check the logs in your deployment platform
- Verify environment variables are set correctly
- Ensure API keys are valid and active
- Check your internet connection and server status

**For Custom Development**:
- Contact CraigeeX for custom bot development
- Available for freelance WhatsApp bot projects
- Specializes in AI integration and advanced features

---

## 📝 License & Legal

### 📄 License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### ⚖️ Terms of Use
- This bot is for educational and personal use
- Respect WhatsApp's Terms of Service
- Don't spam or abuse the bot features
- Creator is not responsible for misuse

### 🔒 Privacy Policy
- No personal data is stored permanently
- Session data is encrypted in MEGA cloud
- AI conversations are processed by Google Gemini
- No conversation logs are maintained

---

## 🙏 Acknowledgments

### 🛠️ Technologies Used
- **[Baileys](https://github.com/WhiskeySockets/Baileys)**: WhatsApp Web API wrapper
- **[Google Gemini](https://ai.google.dev/)**: AI chat capabilities  
- **[ytdl-core](https://github.com/fent/node-ytdl-core)**: YouTube download functionality
- **[MEGA](https://mega.nz/)**: Secure session storage
- **[Render](https://render.com/)**: Reliable hosting platform

### 💝 Special Thanks
- **WhatsApp Community**: For supporting bot development
- **Node.js Community**: For excellent libraries and tools
- **Google**: For providing free Gemini AI access
- **Open Source Contributors**: For making this possible

### 🌟 Contributors
- **CraigeeX**: Main developer and creator
- **You**: For using and supporting the bot!

---

## 🚀 Quick Start Guide

### ⚡ 1-Minute Setup

1. **Get Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API Key

2. **Deploy to Render**: 
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

3. **Set Environment Variables**:
   ```
   GEMINI_API_KEY: your_gemini_api_key
   SESSION_ID: (leave blank for first run)
   OWNER_NUMBER: 27847826044
   ```

4. **Deploy & Monitor**: Check logs for QR code or connection status

5. **Test Bot**: Send `.menu` to verify it's working

6. **Start Using**: Enjoy your AI-powered WhatsApp bot!

### 🎯 First Commands to Try
```
.menu          - See all commands
.alive         - Check if bot is working  
.dev           - Get creator contact
.ciara Hi!     - Test AI chat
.song Despacito - Try song download
.about         - Learn about the bot
```

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Initial release with all core features
- ✅ Gemini AI integration
- ✅ Song/Video download with format selection
- ✅ Customer care system
- ✅ MEGA session storage
- ✅ Always online status
- ✅ Owner privileges and user blocking
- ✅ Comprehensive error handling

### 🔮 Planned Updates
- 🔄 Voice message support
- 🔄 Image generation capabilities  
- 🔄 Multi-language support
- 🔄 Database integration
- 🔄 Advanced analytics
- 🔄 Plugin system

---

## 🌍 Global Usage

**Supported Regions**: Worldwide 🌎
**Languages**: English (primary), expandable
**Time Zones**: All supported with UTC timestamps
**WhatsApp**: Business and Personal accounts

---

## 📚 Documentation Links

- **[Baileys Documentation](https://github.com/WhiskeySockets/Baileys)**
- **[Google Gemini AI Docs](https://ai.google.dev/docs)**
- **[Render Deployment Guide](https://render.com/docs)**
- **[Node.js Documentation](https://nodejs.org/docs/)**
- **[MEGA API Reference](https://github.com/qgustavor/mega)**

---

**Made with ❤️ by CraigeeX - A young developer from Zimbabwe building the future of AI communication!**

---

*CIARA-IV MINI - Where AI meets WhatsApp! 🤖💬*

**🌟 Star this repo if you found it helpful!**  
**🤝 Contributions welcome - let's build together!**  
**📧 Questions? Email: ciara.info.inc@gmail.com**
