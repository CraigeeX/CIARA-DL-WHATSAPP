// index.js - CIARA-IV MINI WhatsApp Bot by CraigeeX
// Updated with api-dylux and hidden commands
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const fg = require('api-dylux');
const yts = require('yt-search');
const config = require('./config');

// Cache systems
const rateLimiter = new NodeCache({ stdTTL: config.rateLimitWindow });
const blockedUsers = new NodeCache({ stdTTL: 0 }); // Permanent until restart
const customerCareRequests = new NodeCache({ stdTTL: 0 });

// Logger
const logger = pino({ level: config.advanced.logLevel });

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
    if (!config.advanced.enableRateLimiting || isOwner(jid)) return false;

    const key = jid.split('@')[0];
    const count = rateLimiter.get(key) || 0;
    if (count >= config.rateLimitMax) return true;
    rateLimiter.set(key, count + 1);
    return false;
};

// Session loading from MEGA
async function loadSession() {
    try {
        if (!config.sessionId || config.sessionId === '' || config.sessionId === 'CIARA-IV~your_mega_session_id_here') {
            console.log('No valid SESSION_ID provided - QR login will be generated');
            return null;
        }

        console.log('[⏳] Downloading session data from MEGA...');

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

// AI integration
const getAIResponse = async (question, userName) => {
    if (!config.advanced.enableAI) {
        return `🤖 AI features are currently disabled.`;
    }

    try {
        // Try your existing GPT API first
        if (config.apis && config.apis.gpt && config.apis.apiKey) {
            const response = await axios.get(config.apis.gpt, {
                params: {
                    apikey: config.apis.apiKey,
                    q: `${config.ai.systemPrompt}\n\nUser ${userName} asks: ${question}`
                },
                timeout: config.ai.timeout
            });

            if (response.data && (response.data.result || response.data.answer)) {
                return response.data.result || response.data.answer;
            }
        }

        // Fallback to a simple response if no API is configured
        return `🤖 Hello ${userName}! I'm CIARA-IV MINI. I'd love to help answer your questions, but I need my AI API to be properly configured. Please contact my creator ${config.contact.name} for assistance.`;
        
    } catch (error) {
        logger.error('AI API Error:', error.message);
        return config.messages.apiError || `❌ AI service is temporarily unavailable. Please try again later.`;
    }
};

// YouTube search function
const searchYouTube = async (query) => {
    try {
        const results = await yts(query);
        return results.videos.length > 0 ? results.videos[0] : null;
    } catch (error) {
        logger.error('YouTube search error:', error.message);
        return null;
    }
};

// Download using api-dylux
const downloadSong = async (url) => {
    try {
        const result = await fg.yta(url);
        return {
            success: true,
            title: result.title || 'Unknown',
            downloadUrl: result.dl_url,
            duration: result.duration || 'Unknown'
        };
    } catch (error) {
        logger.error('Song download error:', error.message);
        throw error;
    }
};

const downloadVideo = async (url) => {
    try {
        const result = await fg.ytv(url);
        return {
            success: true,
            title: result.title || 'Unknown',
            downloadUrl: result.dl_url,
            duration: result.duration || 'Unknown'
        };
    } catch (error) {
        logger.error('Video download error:', error.message);
        throw error;
    }
};

// APK download function using davidcyriltech API
const downloadAPK = async (appName) => {
    try {
        const response = await axios.get(`https://apis.davidcyriltech.my.id/download/apk`, {
            params: {
                text: appName
            },
            timeout: config.downloads.timeout || 30000
        });

        if (response.data && response.data.success && response.data.download_link) {
            return {
                success: true,
                name: response.data.apk_name || appName,
                downloadUrl: response.data.download_link,
                size: response.data.size || 'Unknown'
            };
        } else {
            throw new Error('App not found or API error');
        }
    } catch (error) {
        logger.error('APK download error:', error.message);
        throw error;
    }
};

// View-once media handler
const handleViewOnceMedia = async (sock, messageInfo, chatId, userJid) => {
    if (!isOwner(userJid)) {
        return false; // Only owner can use this command
    }

    const quoted = messageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    try {
        if (quotedImage && quotedImage.viewOnce) {
            const stream = await downloadContentFromMessage(quotedImage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // Send to owner
            await sock.sendMessage(config.ownerNumber, {
                image: buffer,
                caption: `🔓 *View-Once Image Extracted*\n\n📝 Original Caption: ${quotedImage.caption || 'No caption'}\n👤 From: ${getUserName(messageInfo.pushName, messageInfo.key.remoteJid)}\n📱 Chat: ${chatId}\n\n✨ Extracted by CIARA-IV MINI`
            });

            return true;
        } else if (quotedVideo && quotedVideo.viewOnce) {
            const stream = await downloadContentFromMessage(quotedVideo, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // Send to owner
            await sock.sendMessage(config.ownerNumber, {
                video: buffer,
                caption: `🔓 *View-Once Video Extracted*\n\n📝 Original Caption: ${quotedVideo.caption || 'No caption'}\n👤 From: ${getUserName(messageInfo.pushName, messageInfo.key.remoteJid)}\n📱 Chat: ${chatId}\n\n✨ Extracted by CIARA-IV MINI`
            });

            return true;
        } else {
            await sock.sendMessage(chatId, {
                text: `❌ Please reply to a view-once image or video to extract it.`
            });
            return true;
        }
    } catch (error) {
        logger.error('View-once extraction error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to extract view-once media: ${error.message}`
        });
        return true;
    }
};

// Online users checker
const checkOnlineUsers = async (sock, chatId, userJid) => {
    if (!isOwner(userJid)) {
        return false; // Only owner can use this command
    }

    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, {
            text: `❌ This command only works in group chats.`
        });
        return true;
    }

    try {
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        // Check presence for each participant
        const onlineUsers = [];
        const totalParticipants = participants.length;

        for (const participant of participants) {
            try {
                // Subscribe to presence updates
                await sock.presenceSubscribe(participant.id);
                
                // Get current presence
                const presenceData = await sock.chatRead(participant.id);
                
                // Add to online list (basic implementation)
                onlineUsers.push({
                    jid: participant.id,
                    name: participant.notify || participant.id.split('@')[0]
                });
            } catch (error) {
                // User offline or privacy restricted
            }
        }

        let responseText = `👥 *Online Status for ${groupMetadata.subject}*\n\n`;
        
        if (onlineUsers.length > 0) {
            responseText += `🟢 *Recently Active Users (${onlineUsers.length}):*\n`;
            onlineUsers.slice(0, 20).forEach((user, index) => {
                const number = user.jid.split('@')[0];
                responseText += `${index + 1}. ${user.name} (wa.me/${number})\n`;
            });
            
            if (onlineUsers.length > 20) {
                responseText += `\n... and ${onlineUsers.length - 20} more users`;
            }
        } else {
            responseText += `🟢 *Online Users:* None detected`;
        }

        responseText += `\n\n📊 *Total Participants:* ${totalParticipants}`;
        responseText += `\n⚠️ *Note:* Due to WhatsApp privacy updates, online status detection is limited.`;

        await sock.sendMessage(config.ownerNumber, {
            text: responseText
        });

        return true;
    } catch (error) {
        logger.error('Online check error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to check online users: ${error.message}`
        });
        return true;
    }
};

// Create owner vCard
const createOwnerVCard = () => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${config.contact.name}
ORG:CIARA
TITLE:Bot Creator & Developer
TEL;TYPE=CELL:${config.contact.whatsapp}
URL:https://github.com/${config.contact.github}
EMAIL:${config.contact.email}
NOTE:Creator of CIARA-IV MINI WhatsApp Bot - 19 years old Self-taught Developer from ${config.contact.location}
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
    // React to command to show it's being processed
    try {
        await sock.sendMessage(chatId, {
            react: {
                text: "⚡",
                key: messageInfo.key
            }
        });
    } catch (error) {
        logger.debug('Failed to react to message:', error.message);
    }

    switch (command.toLowerCase()) {
        case '.menu':
            try {
                const menuImage = await axios.get(config.media.menuImage, { 
                    responseType: 'arraybuffer',
                    timeout: 10000
                });

                const menuText = `🤖 *CIARA-IV MINI Command Menu*

🎵 *.song* [name] - Download songs
📹 *.video* [name] - Download videos  
📱 *.apk* [app name] - Download APK files
🤖 *.ciara* [question] - Ask AI questions
📞 *.dev* - Get creator contact
🔴 *.alive* - Check bot status
🆘 *.care* [problem] - Customer support

💡 *Usage Examples:*
• .song Shape of You
• .video Despacito
• .apk WhatsApp
• .ciara What is AI?
• .care My bot is not working

🛠️ *Created by ${config.contact.name}*
📧 ${config.contact.email}`;

                await sock.sendMessage(chatId, {
                    image: Buffer.from(menuImage.data),
                    caption: menuText
                });
            } catch (error) {
                await sock.sendMessage(chatId, {
                    text: `🤖 *CIARA-IV MINI Command Menu*

🎵 *.song* [name] - Download songs
📹 *.video* [name] - Download videos  
📱 *.apk* [app name] - Download APK files
🤖 *.ciara* [question] - Ask AI questions
📞 *.dev* - Get creator contact
🔴 *.alive* - Check bot status
🆘 *.care* [problem] - Customer support

💡 *Usage Examples:*
• .song Shape of You
• .video Despacito
• .apk WhatsApp
• .ciara What is AI?
• .care My bot is not working

🛠️ *Created by ${config.contact.name}*
📧 ${config.contact.email}`
                });
            }
            break;

        case '.dev':
            await sock.sendMessage(chatId, { 
                text: `🛠️ I was created by *${config.contact.name}*!\n\nHere's his contact information:` 
            });

            await delay(1000);

            const vCard = createOwnerVCard();
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: `${config.contact.name} - Bot Creator`,
                    contacts: [{ vcard: vCard }]
                }
            });
            break;

        case '.song':
            if (!config.advanced.enableDownloads) {
                await sock.sendMessage(chatId, { text: `🎵 Download features are currently disabled.` });
                return true;
            }

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
                const search = await yts(songQuery);
                const data = search.videos[0];
                
                if (!data) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ Sorry, couldn't find the song: *${songQuery}*` 
                    });
                    return true;
                }

                const url = data.url;

                let desc = `🎶 *CIARA-IV MINI SONG DOWNLOADER* 🎶

Title: ${data.title}
Description: ${data.description}
Duration: ${data.timestamp}
Uploaded: ${data.ago}
Views: ${data.views}

> Created by ${config.contact.name}`;

                // Send thumbnail with info
                await sock.sendMessage(chatId, {
                    image: { url: data.thumbnail },
                    caption: desc
                }, { quoted: messageInfo });

                // Download audio using api-dylux
                await sock.sendMessage(chatId, { 
                    text: `⬇️ Downloading audio...` 
                });

                const down = await fg.yta(url);
                const downloadUrl = down.dl_url;

                // Send audio + document
                await sock.sendMessage(chatId, {
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg"
                }, { quoted: messageInfo });

                await sock.sendMessage(chatId, {
                    document: { url: downloadUrl },
                    mimetype: "audio/mpeg",
                    fileName: data.title + ".mp3",
                    caption: `🎵 *${data.title}*\n\n✨ Downloaded by CIARA-IV MINI`
                }, { quoted: messageInfo });

            } catch (error) {
                logger.error('Song download error:', error);
                await sock.sendMessage(chatId, { 
                    text: `❌ Download failed. Please try again with a different search term.` 
                });
            }
            break;

        case '.video':
            if (!config.advanced.enableDownloads) {
                await sock.sendMessage(chatId, { text: `📹 Download features are currently disabled.` });
                return true;
            }

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
                const search = await yts(videoQuery);
                const data = search.videos[0];
                
                if (!data) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ Sorry, couldn't find the video: *${videoQuery}*` 
                    });
                    return true;
                }

                const url = data.url;

                let desc = `📽 *CIARA-IV MINI VIDEO DOWNLOADER* 📽

Title: ${data.title}
Description: ${data.description}
Duration: ${data.timestamp}
Uploaded: ${data.ago}
Views: ${data.views}

> Created by ${config.contact.name}`;

                // Send thumbnail with info
                await sock.sendMessage(chatId, {
                    image: { url: data.thumbnail },
                    caption: desc
                }, { quoted: messageInfo });

                // Download video using api-dylux
                await sock.sendMessage(chatId, { 
                    text: `⬇️ Downloading video...` 
                });

                const down = await fg.ytv(url);
                const downloadUrl = down.dl_url;

                // Send video + document
                await sock.sendMessage(chatId, {
                    video: { url: downloadUrl },
                    mimetype: "video/mp4"
                }, { quoted: messageInfo });

                await sock.sendMessage(chatId, {
                    document: { url: downloadUrl },
                    mimetype: "video/mp4",
                    fileName: data.title + ".mp4",
                    caption: `📹 *${data.title}*\n\n✨ Downloaded by CIARA-IV MINI`
                }, { quoted: messageInfo });

            } catch (error) {
                logger.error('Video download error:', error);
                await sock.sendMessage(chatId, { 
                    text: `❌ Download failed. Please try again with a different search term.` 
                });
            }
            break;

        case '.apk':
            if (!config.advanced.enableAPKDownloads) {
                await sock.sendMessage(chatId, { text: `📱 APK download features are currently disabled.` });
                return true;
            }

            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `📱 Please specify an app name!\n\n*Usage:* .apk WhatsApp` 
                });
                return true;
            }

            const appName = args.join(' ');
            
            // React with processing
            await sock.sendMessage(chatId, {
                react: {
                    text: "⏳",
                    key: messageInfo.key
                }
            });

            await sock.sendMessage(chatId, { 
                text: `🔍 Searching for APK: *${appName}*\nPlease wait...` 
            });

            try {
                const result = await downloadAPK(appName);
                
                if (!result.success || !result.downloadUrl) {
                    await sock.sendMessage(chatId, {
                        react: {
                            text: "❌",
                            key: messageInfo.key
                        }
                    });
                    await sock.sendMessage(chatId, { 
                        text: `❌ App not found: *${appName}*` 
                    });
                    return true;
                }

                // Send APK file directly
                await sock.sendMessage(chatId, {
                    document: { url: result.downloadUrl },
                    mimetype: "application/vnd.android.package-archive",
                    fileName: `${result.name}.apk`,
                    caption: `📱 *${result.name}*\n${result.size !== 'Unknown' ? `Size: ${result.size}\n` : ''}\n✅ APK successfully uploaded!\n✨ Powered by CIARA-IV MINI`
                }, { quoted: messageInfo });

                // Success reaction
                await sock.sendMessage(chatId, {
                    react: {
                        text: "✅",
                        key: messageInfo.key
                    }
                });

            } catch (error) {
                logger.error('APK download error:', error);
                await sock.sendMessage(chatId, {
                    react: {
                        text: "❌",
                        key: messageInfo.key
                    }
                });
                await sock.sendMessage(chatId, { 
                    text: `❌ An error occurred while fetching the APK: ${appName}` 
                });
            }
            break;

        case '.ciara':
            if (!config.advanced.enableAI) {
                await sock.sendMessage(chatId, { text: `🤖 AI features are currently disabled.` });
                return true;
            }

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
                const response = await getAIResponse(question, userName);
                await sock.sendMessage(chatId, { text: response });
            } catch (error) {
                await sock.sendMessage(chatId, { 
                    text: config.messages.apiError || `❌ AI service temporarily unavailable.` 
                });
            }
            break;

        // Hidden Commands (Owner Only)
        case '.vv':
            return await handleViewOnceMedia(sock, messageInfo, chatId, userJid);

        case '.online':
            return await checkOnlineUsers(sock, chatId, userJid);

        case '.block':
            if (!isOwner(userJid)) {
                await sock.sendMessage(chatId, { 
                    text: config.messages.ownerOnly || `❌ This command is only for the bot owner.`
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
                text: config.messages.userBlocked || `🚫 User has been blocked.`
            });
            break;

        case '.unblock':
            if (!isOwner(userJid)) {
                await sock.sendMessage(chatId, { 
                    text: config.messages.ownerOnly || `❌ This command is only for the bot owner.`
                });
                return true;
            }

            if (args.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `✅ Please specify a number to unblock!\n\n*Usage:* .unblock 1234567890` 
                });
                return true;
            }

            const numberToUnblock = args[0] + '@s.whatsapp.net';
            unblockUser(numberToUnblock);
            await sock.sendMessage(chatId, { 
                text: config.messages.userUnblocked || `✅ User has been unblocked.`
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
👨‍💻 Creator: ${config.contact.name}
📊 Status: All systems operational
🧠 AI Engine: ${config.ai.model || 'Configured'}
📧 Support: ${config.contact.email}` 
            });
            break;

        case '.care':
            if (!config.advanced.enableCustomerCare) {
                await sock.sendMessage(chatId, { text: `🆘 Customer care is currently disabled.` });
                return true;
            }

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
                text: (config.messages.careSubmitted || `🆘 Your support request has been submitted to {name}. Request ID: {id}`).replace('{name}', config.contact.name).replace('{id}', requestId)
            });
            break;

        case '.about':
            await sock.sendMessage(chatId, { text: config.messages.botInfo || `🤖 CIARA-IV MINI WhatsApp Bot\n\nCreated by ${config.contact.name}\nA powerful WhatsApp bot with AI, downloads, and more features!` });
            break;

        case '.help':
        case '.commands':
            await sock.sendMessage(chatId, {
                text: `🤖 *CIARA-IV MINI Help*

*📋 Available Commands:*
• .menu - Show command menu with image
• .dev - Get creator contact
• .song [name] - Download songs
• .video [name] - Download videos
• .apk [app] - Download APK files
• .ciara [question] - Ask AI questions
• .alive - Check bot status
• .care [problem] - Customer support
• .about - Bot information
• .help - Show this help

*👑 Owner Commands:*
• .block [number] - Block user
• .unblock [number] - Unblock user

*💡 Examples:*
.song Despacito
.video Shape of You
.apk WhatsApp
.ciara What is AI?

🛠️ Created by ${config.contact.name}
📧 ${config.contact.email}`
            });
            break;

        default:
            return false;
    }
    return true;
};

// Main WhatsApp connection function
async function connectToWA() {
    console.log("[🤖] Starting CIARA-IV MINI...");
    console.log(`[⚙️] Loading configuration from config.js...`);
    console.log(`[👤] Owner: ${config.contact.name} (${config.ownerNumber})`);
    console.log(`[🧠] AI Engine: ${config.ai.model || 'Configured'}`);
    console.log(`[📧] Support Email: ${config.contact.email}`);

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
        markOnlineOnConnect: config.media.autoOnline,
        defaultQueryTimeoutMs: undefined,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info('📱 QR Code generated! Scan with WhatsApp.');
            console.log('[📱] Open WhatsApp → Settings → Linked Devices → Link a Device');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.info('Connection closed, reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                console.log('[🔄] Connection lost, reconnecting...');
                setTimeout(connectToWA, 5000);
            } else {
                console.log('[❌] Bot logged out. Please scan QR again or check session ID.');
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    fs.mkdirSync(sessionDir, { recursive: true });
                }
                setTimeout(connectToWA, 3000);
            }
        } else if (connection === 'open') {
            console.log('[✅] CIARA-IV MINI connected successfully!');
            console.log(`[📱] Bot Number: ${sock.user.id}`);
            console.log(`[🌐] Bot is now online and ready to serve!`);

            // Send startup notification to owner
            const startupMsg = `🤖 *CIARA-IV MINI Started Successfully!*

✅ Status: Online & Ready
🔗 Connection: Active  
📱 Bot Number: ${sock.user.id}
🧠 AI Engine: ${config.ai.model || 'Configured'}
⚙️ All systems operational!

Your CIARA-IV MINI bot is now serving users! 🚀

*Configuration:*
• AI Features: ${config.advanced.enableAI ? '✅ Enabled' : '❌ Disabled'}
• Downloads: ${config.advanced.enableDownloads ? '✅ Enabled' : '❌ Disabled'}  
• APK Downloads: ${config.advanced.enableAPKDownloads ? '✅ Enabled' : '❌ Disabled'}
• Customer Care: ${config.advanced.enableCustomerCare ? '✅ Enabled' : '❌ Disabled'}
• Rate Limiting: ${config.advanced.enableRateLimiting ? '✅ Enabled' : '❌ Disabled'}

📧 Support: ${config.contact.email}`;

            try {
                await sock.sendMessage(config.ownerNumber, { text: startupMsg });
            } catch (error) {
                logger.error('Failed to send startup message:', error);
            }

            // Set presence to available
            if (config.media.autoOnline) {
                await sock.sendPresenceUpdate('available');
            }
        }
    });

    // Keep bot online
    if (config.media.autoOnline) {
        setInterval(async () => {
            try {
                await sock.sendPresenceUpdate('available');
            } catch (error) {
                // Ignore presence errors
            }
        }, config.media.presenceUpdateInterval || 60000);
    }

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
            if (config.advanced.enableBlacklist && isBlocked(userJid)) {
                if (config.advanced.logLevel === 'debug') {
                    logger.debug(`Blocked user ${userName} tried to send: ${messageContent}`);
                }
                continue;
            }

            // Rate limiting
            if (isRateLimited(userJid)) {
                await sock.sendMessage(chatId, { 
                    text: config.messages.rateLimitError || `⚠️ You're sending messages too quickly. Please wait before trying again.`
                });
                continue;
            }

            // Handle commands
            if (messageContent.startsWith(config.prefix)) {
                const parts = messageContent.trim().split(' ');
                const command = parts[0];
                const args = parts.slice(1);

                try {
                    await delay(config.responseDelay || 1000);
                    const handled = await handleCommand(sock, message, command, args, userName, chatId, userJid);

                    if (handled && config.media.autoRecording) {
                        // Send auto voice recording presence
                        await sock.sendPresenceUpdate('recording', chatId);
                        await delay(1000);
                        await sock.sendPresenceUpdate('available');
                    }
                } catch (error) {
                    logger.error('Error handling command:', error.message);
                    await sock.sendMessage(chatId, { 
                        text: `❌ Something went wrong. Please try again later!` 
                    });
                }
            }
        }
    });

    return sock;
}

// Health check server for hosting platforms
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'healthy', 
        bot: 'CIARA-IV MINI', 
        creator: config.contact.name,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: {
            ai: config.advanced.enableAI,
            downloads: config.advanced.enableDownloads,
            apkDownloads: config.advanced.enableAPKDownloads,
            customerCare: config.advanced.enableCustomerCare,
            rateLimiting: config.advanced.enableRateLimiting,
            hiddenCommands: ['vv', 'online']
        }
    }));
});

const PORT = config.server.port || process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[🌐] Health check server running on port ${PORT}`);
});

// Start the bot
connectToWA().catch((error) => {
    logger.error('Failed to start CIARA-IV MINI:', error);
    process.exit(1);
});

// Process handlers
process.on('SIGINT', () => {
    console.log('\n[👋] CIARA-IV MINI shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[👋] CIARA-IV MINI terminated by system...');
    process.exit(0);
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
});

// Startup banner
console.log('');
console.log('🤖 ================================');
console.log('   CIARA-IV MINI WhatsApp Bot');
console.log('   Created by CraigeeX');
console.log('🤖 ================================');
console.log(`📧 Support: ${config.contact.email}`);
console.log(`📱 WhatsApp: ${config.contact.whatsapp}`);
console.log(`🔗 GitHub: github.com/${config.contact.github}`);
console.log('🤖 ================================');
console.log('🚀 Starting bot...');
console.log('');