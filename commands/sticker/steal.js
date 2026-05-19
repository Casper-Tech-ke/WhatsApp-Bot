// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker
// Take any sticker and add custom metadata
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default {
    name: 'steal',
    alias: ['take', 'clone', 'snatch', 'copysticker'],
    description: 'Steal a sticker and add custom pack name/emoji',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const sendMessage = async (text) => {
            return await xcasper.sendMessage(chatId, { text }, { quoted: msg });
        };
        
        try {
            // Get pushname (user's display name)
            const pushname = msg.pushName || msg.sender?.split('@')[0] || "User";
            
            // Check if message is a reply to a sticker
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMessage?.stickerMessage) {
                // Alternative check: check msg.quoted
                if (!msg.quoted?.message?.stickerMessage) {
                    return await sendMessage("❌ *Reply to a sticker first!*\n\nReply to any sticker with .steal to copy it\n\n*Example:* Reply to sticker with: .steal 😎\n\nOr with custom pack: .steal MyPack MyName");
                }
            }
            
            // Get the actual quoted message
            const stickerMessage = quotedMessage?.stickerMessage || msg.quoted?.message?.stickerMessage;
            
            if (!stickerMessage) {
                return await sendMessage("❌ *That's not a sticker!*\n\nPlease reply to a sticker message.");
            }
            
            // Parse args for emoji, pack name, author
            let emoji = '🤖';
            let packName = 'ALICIAH AI';
            let author = 'CASPER TECH KE';
            
            if (args.length > 0) {
                // Check if first arg is an emoji
                const emojiRegex = /[\u{1F600}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
                if (emojiRegex.test(args[0])) {
                    emoji = args[0];
                    if (args.length > 1) packName = args[1];
                    if (args.length > 2) author = args.slice(2).join(' ');
                } else {
                    packName = args[0];
                    if (args.length > 1) author = args.slice(1).join(' ');
                }
            }
            
            // Send processing message
            await sendMessage(`📦 *Processing Sticker*\n\n✨ Pack: *${packName}*\n👤 By: ${author}\n🎭 Emoji: ${emoji}\n⏳ Please wait...`);
            
            try {
                // Get the message key for download
                const messageKey = msg.quoted?.key || {
                    remoteJid: chatId,
                    id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                    participant: msg.sender
                };
                
                // Download the sticker using Baileys method
                const stickerBuffer = await downloadMediaMessage(
                    {
                        key: messageKey,
                        message: { stickerMessage },
                        messageType: 'stickerMessage'
                    },
                    'buffer',
                    {},
                    {
                        logger: console,
                        reuploadRequest: xcasper.updateMediaMessage
                    }
                );
                
                if (!stickerBuffer) {
                    return await sendMessage("❌ Failed to download sticker\n\n💡 The sticker might be too large or corrupted.");
                }
                
                // Add metadata using webpmux
                const img = new webp.Image();
                await img.load(stickerBuffer);
                
                // Create metadata
                const json = {
                    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                    'sticker-pack-name': packName,
                    'sticker-pack-publisher': author,
                    'emojis': [emoji]
                };
                
                // Create exif buffer
                const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
                const exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);
                
                img.exif = exif;
                
                const finalBuffer = await img.save(null);
                
                await xcasper.sendMessage(chatId, {
                    sticker: finalBuffer
                }, { quoted: msg });
                
                // Send success message
                await sendMessage(`✅ *Sticker Stolen Successfully!*\n\n📦 Pack: ${packName}\n👤 By: ${author}\n🎭 Emoji: ${emoji}\n\n💡 The sticker now shows under "${packName}" pack`);
                
            } catch (error) {
                console.error('Sticker processing error:', error);
                
                let errorMsg = "❌ *Sticker Processing Error*\n\n";
                if (error.message.includes('webp') || error.message.includes('Image')) {
                    errorMsg += "Invalid sticker format or corrupted sticker.\n";
                    errorMsg += "Try with a different sticker.\n";
                } else if (error.message.includes('download')) {
                    errorMsg += "Failed to download sticker.\n";
                    errorMsg += "The sticker might be too large.\n";
                } else {
                    errorMsg += `Error: ${error.message}\n`;
                }
                
                errorMsg += "\n📌 *Requirements:*\n";
                errorMsg += "• Sticker must be WebP format\n";
                
                await sendMessage(errorMsg);
            }
            
        } catch (error) {
            console.error('Error in steal command:', error);
            await sendMessage(`❌ Command Error: ${error.message}\n\nTry sending the command again.`);
        }
    }
};
