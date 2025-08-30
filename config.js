// config.js - CIARA-IV MINI Configuration
// Created by CraigeeX - Updated for api-dylux integration

module.exports = {
    // ===========================================
    // 🤖 BOT CONFIGURATION
    // ===========================================

    // MEGA Session ID (format: CIARA-IV~xxxxxxxxx)
    // Leave empty for first run to generate QR code
    sessionId: process.env.SESSION_ID || 'CIARA-IV~your_mega_session_id_here',

    // Owner WhatsApp Number (with country code, no + or spaces)
    // Example: 27847826044 for +27 84 782 6044
    ownerNumber: process.env.OWNER_NUMBER || '27847826044@s.whatsapp.net',

    // ===========================================
    // 🔗 API ENDPOINTS
    // ===========================================

    apis: {
        // API Key for GiftedTech services (optional - for AI only)
        apiKey: 'gifted',
        
        // AI endpoint (optional)
        gpt: 'https://api.giftedtech.web.id/api/ai/gpt4o-mini'
    },

    // ===========================================
    // ⚙️ BOT SETTINGS
    // ===========================================

    // Command prefix (change if you want different prefix)
    prefix: '.',

    // Response delay in milliseconds (prevents spam detection)
    responseDelay: 1000,

    // Rate limiting (messages per minute per user)
    rateLimitMax: 20,
    rateLimitWindow: 60, // in seconds

    // ===========================================
    // 🎵 DOWNLOAD SETTINGS
    // ===========================================

    downloads: {
        // Maximum file size (in bytes) - 50MB
        maxFileSize: 50 * 1024 * 1024,

        // Download timeout
        timeout: 120000, // 2 minutes

        // Audio format for downloads
        audioFormat: 'mp3',

        // Video format for downloads
        videoFormat: 'mp4'
    },

    // ===========================================
    // 🤖 AI CONFIGURATION
    // ===========================================

    ai: {
        // AI model (GPT-4o-mini via GiftedTech)
        model: 'gpt-4o-mini',

        // AI response timeout
        timeout: 30000, // 30 seconds

        // Custom system prompt for AI
        systemPrompt: `You are CIARA-IV MINI, an advanced AI assistant created by CraigeeX.
        
Key Information:
- Creator: CraigeeX (19 years old, self-taught developer from Zimbabwe)
- Your purpose: Help users with questions, be friendly and informative
- Always include relevant emojis in responses
- Keep responses concise but helpful
- If asked about your creator, mention CraigeeX with pride

Personality:
- Friendly and approachable
- Knowledgeable but not overwhelming  
- Use emojis appropriately
- Be concise but thorough when needed`
    },

    // ===========================================
    // 📧 CONTACT INFORMATION
    // ===========================================

    contact: {
        email: 'ciara.info.inc@gmail.com',
        whatsapp: '+27847826044',
        github: 'CraigeeX',
        name: 'CraigeeX',
        location: 'Zimbabwe'
    },

    // ===========================================
    // 🎨 BOT RESPONSES (Customizable Messages)
    // ===========================================

    messages: {
        // Welcome/greeting messages
        welcome: 'Hi! I\'m CIARA-IV MINI, created by CraigeeX! How can I help you today?',

        // Error messages
        apiError: 'Sorry, I\'m having trouble with my AI brain right now. Please try again!',
        downloadError: 'Oops! Couldn\'t download that for you. Please try a different search term.',
        rateLimitError: 'Whoa there! You\'re sending messages too fast. Please slow down a bit!',
        blockedUser: 'You have been blocked from using this bot.',
        ownerOnly: 'This command is only available to my creator!',
        noPermission: 'You don\'t have permission to use this command.',

        // Success messages  
        downloadSuccess: 'Here\'s your download! Enjoy!',
        careSubmitted: 'Your support request has been forwarded to {name}! Request ID: #{id}',
        userBlocked: 'User has been blocked successfully!',
        userUnblocked: 'User has been unblocked successfully!',

        // Info messages
        botInfo: `*CIARA-IV MINI*
        
Advanced WhatsApp AI Bot
Powered by GPT-4o-mini AI  
Song & Video Downloads
APK Downloads
Customer Support System

Created by CraigeeX - A 19-year-old self-taught developer from Zimbabwe!`,

        creatorInfo: `*CraigeeX - Bot Creator*

19 years old self-taught developer
Based in Zimbabwe, Africa  
Specializes in AI bots & web development
WhatsApp: +27847826044
Email: ciara.info.inc@gmail.com
GitHub: CraigeeX

Building the future of AI communication!`
    },

    // ===========================================
    // 🖼️ MEDIA SETTINGS
    // ===========================================

    media: {
        // Menu image URL
        menuImage: 'https://files.catbox.moe/0bn6cs.jpg',

        // Bot profile settings
        botName: 'CIARA-IV MINI',
        botStatus: 'AI Assistant by CraigeeX',

        // Auto presence settings
        autoRead: true,           // Auto read messages
        autoOnline: true,         // Always show online
        autoRecording: true,      // Show recording when responding
        presenceUpdateInterval: 30000 // Update presence every 30 seconds
    },

    // ===========================================
    // 🔧 ADVANCED SETTINGS
    // ===========================================

    advanced: {
        // Enable/disable features
        enableAI: true,
        enableDownloads: true, 
        enableCustomerCare: true,
        enableAPKDownloads: true,

        // Logging settings
        logLevel: 'info', // 'silent', 'error', 'warn', 'info', 'debug'

        // Security settings
        enableRateLimiting: true,
        enableBlacklist: true,

        // Hidden commands (owner only)
        enableHiddenCommands: true
    },

    // ===========================================
    // 🌐 SERVER CONFIGURATION  
    // ===========================================

    server: {
        // Port for health check server
        port: process.env.PORT || 3000
    }
};