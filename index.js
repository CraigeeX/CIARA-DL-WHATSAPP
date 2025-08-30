// index.js - CIARA-IV MINI WhatsApp Bot by CraigeeX
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

// Configuration
const config = {
    sessionId: process.env.SESSION_ID || '', // CIARA-IV~xxxxx format
    geminiApiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE',
    ownerNumber: process.env.OWNER_NUMBER || '27847826044@s.whatsapp.net',
    botNumber: '', // Will be set when bot connects
    prefix: '.',
    responseDelay: 1000,
    sessionCacheTTL: 3600,
    rateLimitMax: 20,
    rateLimitWindow: 60
};

// Cache systems
const rateLimiter = new NodeCache({ stdTTL: config.rateLimitWindow });
const blockedUsers = new NodeCache({ stdTTL: 0 }); // Permanent until restart
const customerCareRequests = new NodeCache({ stdTTL: 0 });

// Logger
const logger = pino({ level: 'info' });

// Session management
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isOwner = (jid) => {
    const cleanJid = jid.split('@')[0];
    const ownerClean = config.ownerNumber.split('@')[0];
    return cleanJid === ownerClean;
};

const isBlocked = (jid) => {
    return blockedUsers.get(jid.split('@')[0]) === true;
};

const blockUser = (jid) => {
    blockedUsers.set(jid.split('@')[0], true);
};

const unblockUser = (jid) => {
    blockedUsers.del(jid.split('@')[0]);
};

const getUserName = (pushName, jid) => {
    return pushName || jid.split('@')[0];
};

const getChatId = (messageInfo) => {
    return messageInfo.key.remoteJid;
};

// Rate limiting
const isRateLimited = (jid) => {
    if (isOwner(jid)) return false;
    
    const key = jid.split('@')[0];
    const count = rateLimiter.get(key) || 0;
    if (count >= config.rateLimitMax) return true;
    rateLimiter.set(key, count + 1);
    return false;
};

// Session loading from MEGA
async function loadSession() {
    try {
        if (!config.sessionId || config.sessionId === '') {
            console.log('No SESSION_ID provided - QR login will be generated');
            return null;
        }

        console.log('[⏳] Downloading session data...');
        
        // Remove "CIARA-IV~" prefix if present
        const megaFileId = config.sessionId.startsWith('CIARA-IV~') 
            ? config.sessionId.replace("CIARA-IV~", "") 
            : config.sessionId;

        const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);

        const data = await new Promise((resolve, reject) => {
            filer.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        fs.writeFileSync(credsPath, data);
        console.log('[✅] MEGA session downloaded successfully');
        return JSON.parse(data.toString());
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        console.log('Will generate QR code instead');
        return null;
    }
}

// Gemini AI integration
const getGeminiResponse = async (question, userName) => {
    if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        return `Hey ${userName}, I need my Gemini API key to be configured first! 🤖`;
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiApiKey}`,
            {
                contents: [{
                    parts: [{
                        text: `You are CIARA-IV MINI, an AI assistant created by CraigeeX. User ${userName} asks: ${question}. Give a helpful, friendly response.`
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        return response.data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        logger.error('Gemini API Error:', error.message);
        return `Sorry ${userName}, I'm having trouble processing your question right now. Please try again! 🤔`;
    }
};

// YouTube search and download
const searchYouTube = async (query) => {
    try {
        const results = await yts(query);
        return results.videos.length > 0 ? results.videos[0] : null;
    } catch (error) {
        logger.error('YouTube search error:', error.message);
        return null;
    }
};

const downloadYouTubeAudio = async (url) => {
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        
        return {
            stream: ytdl(url, { format }),
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds
        };
    } catch (error) {
        logger.error('YouTube download error:', error.message);
        throw error;
    }
};

// Create owner vCard
const createOwnerVCard = () => {
    return `BEGIN:VCARD
VERSION:3.0
FN:CraigeeX
ORG:CIARA
TITLE:Bot Creator & Developer
TEL;TYPE=CELL:+27847826044
URL:https://github.com/CraigeeX
NOTE:Creator of CIARA-IV MINI WhatsApp Bot - 19 years old Self-taught Developer from Zimbabwe
END:VCARD`;
};

// Notify owner
const notifyOwner = async (sock, message) => {
    try {
        await sock.sendMessage(config.ownerNumber, { text: `🔔 CIARA-IV MINI Alert:\n${message}` });
    } catch (error) {
        logger.error('Failed to notify owner:', error.message);
    }
};

// Command handlers
const handleCommand = async (sock, messageInfo, command, args, userName, chatId, userJid) => {
    const isGroup = chatId.endsWith('@g.us');
    const chatType = isGroup ? 'group' : 'private';

    switch (command.toLowerCase()) {
        case '.menu':
            try {
                const menuImage = await axios.get('https://files.catbox.moe/0bn6cs.jpg', { 
                    responseType: 'arraybuffer' 
                });
                
                const menuText = `🤖 *CIARA-IV MINI Command Menu*

🎵 *.song* [name] - Download songs
📹 *.video* [name] - Download videos  
🤖 *.ciara* [question] - Ask AI questions
📞 *.dev* - Get creator contact
🔴 *.alive* - Check bot status
🆘 *.care* [problem] - Customer support

💡 *Usage Examples:*
• .song Shape of You
• .video Despacito
• .ciara What is AI?
• .care My bot is not working

🛠️ *Created by CraigeeX*
📧 ciara.info.inc@gmail.com`;

                await sock.sendMessage(chatId, {
                    image: Buffer.from(menuImage.data),
                    caption: menuText
                });
            } catch (error) {
                await sock.sendMessage(chatId, {
                    text: `🤖 *CIARA-IV MINI Command Menu*

🎵 *.song* [name] - Download songs
📹 *.video* [name] - Download videos  
🤖 *.ciara* [question] - Ask AI questions
📞 *.dev* - Get creator contact
🔴 *.alive* - Check bot status
🆘 *.care* [problem] - Customer support

💡 *Usage Examples:*
• .song Shape of You
• .video Despacito
• .ciara What is AI?
• .care My bot is not working

🛠️ *Created by CraigeeX*
📧 ciara.info.inc@gmail.com`
                });
            }
            break;

        case '.dev':
            await sock.sendMessage(chatId, { 
                text: `🛠️ I was created by *CraigeeX*!\n\nHere's his contact information:` 
            });
            
            await delay(1000);
            
            const vCard = createOwnerVCard();
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: "CraigeeX - Bot Creator",
                    contacts: [{ vcard: vCard }]
                }
            });
            break;

        case '.song':
            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `🎵 Please specify a song name!\n\n*Usage:* .song Shape of You` 
                });
                return true;
            }

            const songQuery = args.join(' ');
            await sock.sendMessage(chatId, { 
                text: `🔍 Searching for: *${songQuery}*\nPlease wait...` 
            });

            try {
                const video = await searchYouTube(songQuery);
                if (!video) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ Sorry, couldn't find the song: *${songQuery}*` 
                    });
                    return true;
                }

                await sock.sendMessage(chatId, { 
                    text: `🎵 Found: *${video.title}*\n\nChoose format:\n*1.* Audio\n*2.* Document\n\nReply with 1 or 2` 
                });
                
                // Store the video info for format selection
                // In production, you'd want to use a proper cache/database
                
            } catch (error) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Error downloading song. Please try again later.` 
                });
            }
            break;

        case '.video':
            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `📹 Please specify a video name!\n\n*Usage:* .video Despacito` 
                });
                return true;
            }

            const videoQuery = args.join(' ');
            await sock.sendMessage(chatId, { 
                text: `🔍 Searching for video: *${videoQuery}*\nPlease wait...` 
            });

            try {
                const video = await searchYouTube(videoQuery);
                if (!video) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ Sorry, couldn't find the video: *${videoQuery}*` 
                    });
                    return true;
                }

                await sock.sendMessage(chatId, { 
                    text: `📹 Found: *${video.title}*\n\nChoose format:\n*1.* Audio\n*2.* Document\n\nReply with 1 or 2` 
                });
                
            } catch (error) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Error downloading video. Please try again later.` 
                });
            }
            break;

        case '.ciara':
            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `🤖 Hi ${userName}! I'm CIARA-IV MINI. Ask me a question!\n\n*Usage:* .ciara What is AI?` 
                });
                return true;
            }

            const question = args.join(' ');
            await sock.sendMessage(chatId, { 
                text: `🤖 Thinking about your question...` 
            });

            try {
                const response = await getGeminiResponse(question, userName);
                await sock.sendMessage(chatId, { text: response });
            } catch (error) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Sorry, I couldn't process your question right now.` 
                });
            }
            break;

        case '.block':
            if (!isOwner(userJid)) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Only my creator can use this command!` 
                });
                return true;
            }

            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `🚫 Please specify a number to block!\n\n*Usage:* .block 1234567890` 
                });
                return true;
            }

            const numberToBlock = args[0] + '@s.whatsapp.net';
            blockUser(numberToBlock);
            await sock.sendMessage(chatId, { 
                text: `🚫 User ${args[0]} has been blocked!` 
            });
            break;

        case '.alive':
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            
            await sock.sendMessage(chatId, { 
                text: `🤖 *CIARA-IV MINI Status*

✅ Bot is alive and running!
⏰ Uptime: ${hours}h ${minutes}m
🔗 Connection: Online
👨‍💻 Creator: CraigeeX
📊 Status: All systems operational` 
            });
            break;

        case '.care':
            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `🆘 Please describe your problem!\n\n*Usage:* .care My bot is not responding` 
                });
                return true;
            }

            const problem = args.join(' ');
            const requestId = Date.now();
            
            customerCareRequests.set(requestId, {
                user: userName,
                number: userJid,
                problem: problem,
                timestamp: new Date().toISOString()
            });

            // Forward to owner
            const careMessage = `🆘 *Customer Care Request #${requestId}*

👤 User: ${userName}
📱 Number: ${userJid}
❓ Problem: ${problem}
🕐 Time: ${new Date().toLocaleString()}

Please respond to help this user!`;

            await notifyOwner(sock, careMessage);
            
            await sock.sendMessage(chatId, { 
                text: `🆘 Your support request has been forwarded to CraigeeX!\n\n*Request ID:* #${requestId}\n\nYou'll receive a response soon. Thank you for your patience! 😊` 
            });
            break;

        case '.about':
            const aboutText = `🤖 *About CIARA-IV MINI*

*Bot Information:*
• Name: CIARA-IV MINI
• Version: Advanced WhatsApp Assistant
• Features: Song/Video Download, AI Chat, Customer Care
• Session: MEGA Cloud Storage Support

*Creator Information:*
• Name: CraigeeX
• Age: 19 years old
• Background: Self-taught Developer from Zimbabwe
• Specialization: WhatsApp Bots & AI Integration
• GitHub: CraigeeX

*Technical Features:*
• MEGA Session Support (CIARA-IV~ format)
• Gemini AI Integration
• YouTube Download Capabilities
• Always Online Status
• Auto Voice Recording
• Customer Care System

*Contact:*
📧 ciara.info.inc@gmail.com
📱 +27847826044

🛠️ Built with passion by a young Zimbabwean developer!`;

            await sock.sendMessage(chatId, { text: aboutText });
            break;

        default:
            return false;
    }
    return true;
};

// Main WhatsApp connection function
async function connectToWA() {
    console.log("[🤖] Starting CIARA-IV MINI...");

    // Load session if available
    const creds = await loadSession();

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir, {
        creds: creds || undefined
    });

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !creds,
        browser: Browsers.macOS("Safari"),
        syncFullHistory: false,
        auth: state,
        version,
        getMessage: async () => ({}),
        markOnlineOnConnect: true, // Always online
        defaultQueryTimeoutMs: undefined,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info('📱 QR Code generated! Scan with WhatsApp.');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.info('Connection closed, reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                setTimeout(connectToWA, 5000);
            } else {
                console.log('[❌] Bot logged out. Please scan QR again.');
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    fs.mkdirSync(sessionDir, { recursive: true });
                }
                setTimeout(connectToWA, 3000);
            }
        } else if (connection === 'open') {
            console.log('[✅] CIARA-IV MINI connected successfully!');
            
            // Set bot number
            config.botNumber = sock.user.id;
            
            // Send startup notification to owner
            const startupMsg = `🤖 *CIARA-IV MINI Started!*

✅ Status: Online
🔗 Connection: Active  
📱 Number: ${sock.user.id}
🛠️ All systems operational!

Your CIARA-IV MINI bot is ready to serve users! 🚀`;

            try {
                await sock.sendMessage(config.ownerNumber, { text: startupMsg });
            } catch (error) {
                logger.error('Failed to send startup message:', error);
            }

            // Set presence to available
            await sock.sendPresenceUpdate('available');
        }
    });

    // Keep bot online
    setInterval(async () => {
        try {
            await sock.sendPresenceUpdate('available');
        } catch (error) {
            // Ignore presence errors
        }
    }, 30000); // Update presence every 30 seconds

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const message of messages) {
            if (!message.message || message.key.fromMe) continue;

            const messageContent = message.message.conversation || 
                                 message.message.extendedTextMessage?.text || '';

            if (!messageContent) continue;

            const chatId = getChatId(message);
            const userName = getUserName(message.pushName, message.key.remoteJid);
            const userJid = message.key.participant || message.key.remoteJid;

            // Check if user is blocked
            if (isBlocked(userJid)) {
                continue;
            }

            // Rate limiting
            if (isRateLimited(userJid)) {
                await sock.sendMessage(chatId, { 
                    text: `⏰ Please slow down! You're sending messages too quickly.` 
                });
                continue;
            }

            // Handle commands
            if (messageContent.startsWith(config.prefix)) {
                const parts = messageContent.trim().split(' ');
                const command = parts[0];
                const args = parts.slice(1);

                try {
                    await delay(config.responseDelay);
                    const handled = await handleCommand(sock, message, command, args, userName, chatId, userJid);
                    
                    if (handled) {
                        // Send auto voice recording presence
                        await sock.sendPresenceUpdate('recording', chatId);
                        await delay(1000);
                        await sock.sendPresenceUpdate('available');
                    }
                } catch (error) {
                    logger.error('Error handling command:', error.message);
                    await sock.sendMessage(chatId, { 
                        text: `❌ Something went wrong. Please try again!` 
                    });
                }
            }
        }
    });

    return sock;
}

// Health check server for Render
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'healthy', 
        bot: 'CIARA-IV MINI', 
        creator: 'CraigeeX',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[🌐] Health server running on port ${PORT}`);
});

// Start the bot
connectToWA().catch((error) => {
    logger.error('Failed to start CIARA-IV MINI:', error);
    process.exit(1);
});

// Process handlers
process.on('SIGINT', () => {
    logger.info('CIARA-IV MINI shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('CIARA-IV MINI terminated...');
    process.exit(0);
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
});

console.log('🤖 CIARA-IV MINI WhatsApp Bot by CraigeeX');
console.log('📧 Support: ciara.info.inc@gmail.com');
console.log('🚀 Starting bot...');
