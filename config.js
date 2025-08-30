// config.js - CIARA-IV MINI Configuration by CraigeeX
module.exports = {
    // Bot Basic Settings
    prefix: '.',
    botName: 'CIARA-IV MINI',
    version: '2.0.0',
    
    // Owner Information
    ownerNumber: '254xxxxxxxxx@s.whatsapp.net', // Replace with your number
    
    // Contact Information
    contact: {
        name: 'CraigeeX',
        whatsapp: '+254xxxxxxxxx', // Replace with your number
        email: 'craigee@example.com', // Replace with your email
        github: 'CraigeeX', // Replace with your GitHub username
        location: 'Kenya'
    },
    
    // Session Management
    sessionId: 'CIARA-IV~your_mega_session_id_here', // Replace with your MEGA session ID
    
    // API Configuration
    apis: {
        apiKey: 'your_api_key_here', // Your GiftedTech API key if using GPT
        gpt: 'https://api.giftedtech.my.id/api/gpt4', // GPT API endpoint (optional)
    },
    
    // AI Configuration
    ai: {
        model: 'GPT-4o-mini',
        systemPrompt: 'You are CIARA-IV MINI, a helpful WhatsApp bot created by CraigeeX. Be friendly, helpful, and use appropriate emojis in your responses.',
        timeout: 30000
    },
    
    // Rate Limiting
    rateLimitWindow: 60, // seconds
    rateLimitMax: 10, // max commands per window
    responseDelay: 1000, // ms delay before responding
    
    // Download Settings
    downloads: {
        timeout: 60000, // 60 seconds timeout for downloads
        audioQuality: 'highestaudio',
        videoQuality: 'highest'
    },
    
    // Media Settings
    media: {
        autoOnline: true,
        autoRecording: false,
        presenceUpdateInterval: 60000, // 1 minute
        menuImage: 'https://i.imgur.com/placeholder.jpg' // Replace with your menu image URL
    },
    
    // Advanced Features
    advanced: {
        enableAI: true,
        enableDownloads: true,
        enableAPKDownloads: true,
        enableCustomerCare: true,
        enableRateLimiting: true,
        enableBlacklist: true,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    },
    
    // Server Settings
    server: {
        port: process.env.PORT || 3000
    },
    
    // Bot Messages
    messages: {
        // Error Messages
        apiError: '❌ AI service is temporarily unavailable. Please try again later.',
        downloadError: '❌ Download failed. Please try again with a different search term.',
        rateLimitError: '⚠️ You are sending commands too quickly. Please wait a moment before trying again.',
        
        // Permission Messages
        ownerOnly: '❌ This command is only available to the bot owner.',
        
        // User Management
        userBlocked: '🚫 User has been blocked successfully.',
        userUnblocked: '✅ User has been unblocked successfully.',
        
        // Customer Care
        careSubmitted: '🆘 Your support request has been submitted to {name}.\n\nRequest ID: #{id}\n\nYou will receive a response soon!',
        
        // Bot Information
        botInfo: `🤖 *CIARA-IV MINI WhatsApp Bot*

🛠️ *Creator:* CraigeeX
📧 *Support:* craigee@example.com
🌐 *GitHub:* github.com/CraigeeX
📱 *Version:* 2.0.0

✨ *Features:*
• AI Chat Assistant
• YouTube Song & Video Downloads
• APK Downloads
• Customer Support System
• Owner Management Tools

🔧 *Powered by:*
• Baileys WhatsApp Library
• api-dylux for Downloads
• MEGA for Session Storage

> A powerful yet lightweight WhatsApp bot designed for efficiency and user experience.`
    }
};