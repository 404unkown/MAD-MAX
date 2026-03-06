const Config = require('../set');
const fs = require('fs');
const path = require('path');

// File to store notes
const notesFile = path.join(__dirname, '..', 'data', 'notes.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize notes file if it doesn't exist
function initNotesFile() {
    try {
        if (!fs.existsSync(notesFile)) {
            fs.writeFileSync(notesFile, JSON.stringify({ notes: [] }, null, 2));
        }
    } catch (error) {
        console.error('Error initializing notes file:', error);
    }
}

// Call init
initNotesFile();

// Read all notes
function readNotes() {
    try {
        const data = fs.readFileSync(notesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notes:', error);
        return { notes: [] };
    }
}

// Write notes to file
function writeNotes(data) {
    try {
        fs.writeFileSync(notesFile, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing notes:', error);
        return false;
    }
}

// Add a note
function addNote(title, content) {
    try {
        const data = readNotes();
        const newNote = {
            id: data.notes.length > 0 ? Math.max(...data.notes.map(n => n.id)) + 1 : 1,
            title: title,
            content: content || '',
            createdAt: new Date().toISOString()
        };
        data.notes.push(newNote);
        writeNotes(data);
        return newNote;
    } catch (error) {
        console.error('Error adding note:', error);
        return null;
    }
}

// Remove a note by ID
function removeNote(id) {
    try {
        const data = readNotes();
        const initialLength = data.notes.length;
        data.notes = data.notes.filter(note => note.id !== id);
        
        if (data.notes.length < initialLength) {
            writeNotes(data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error removing note:', error);
        return false;
    }
}

// Get all notes
function getNotes() {
    try {
        const data = readNotes();
        return data.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
}

// Get a specific note by ID
function getNote(id) {
    try {
        const data = readNotes();
        return data.notes.find(note => note.id === id) || null;
    } catch (error) {
        console.error('Error getting note:', error);
        return null;
    }
}

// Clear all notes
function clearNotes() {
    try {
        writeNotes({ notes: [] });
        return true;
    } catch (error) {
        console.error('Error clearing notes:', error);
        return false;
    }
}

// Update a note
function updateNote(id, updates) {
    try {
        const data = readNotes();
        const noteIndex = data.notes.findIndex(note => note.id === id);
        
        if (noteIndex === -1) return null;
        
        data.notes[noteIndex] = {
            ...data.notes[noteIndex],
            ...updates,
            id: id // Ensure ID doesn't change
        };
        
        writeNotes(data);
        return data.notes[noteIndex];
    } catch (error) {
        console.error('Error updating note:', error);
        return null;
    }
}

// Format note for display
function formatNote(note) {
    const date = new Date(note.createdAt).toLocaleString();
    return `📝 *${note.title}*\n🆔 ID: ${note.id}\n📅 ${date}\n\n${note.content || '_No content_'}`;
}

// Notes command handler
async function notesCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const subCommand = args[0]?.toLowerCase();

        // No arguments - show help
        if (!subCommand) {
            const notes = getNotes();
            const noteCount = notes.length;
            
            let recentNotes = '';
            if (noteCount > 0) {
                recentNotes = notes.slice(0, 5).map(n => `• ${n.id}: ${n.title}`).join('\n');
            }

            await client.sendMessage(chatId, {
                text: `📔 *NOTES SYSTEM*\n\n` +
                      `Total Notes: ${noteCount}\n\n` +
                      `${recentNotes ? `*Recent Notes:*\n${recentNotes}\n\n` : ''}` +
                      `*Commands:*\n` +
                      `▸ .notes add [title]|[content] - Add note\n` +
                      `▸ .notes list - List all notes\n` +
                      `▸ .notes view [id] - View note by ID\n` +
                      `▸ .notes delete [id] - Delete note by ID\n` +
                      `▸ .notes search [keyword] - Search notes\n` +
                      `▸ .notes clear - Delete ALL notes (Owner only)\n\n` +
                      `*Examples:*\n` +
                      `.notes add Shopping|Milk, eggs, bread\n` +
                      `.notes view 1\n` +
                      `.notes search meeting\n\n` +
                      `> ${Config.caption || 'MAD-MAX BOT'}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // ===== ADD NOTE =====
        if (subCommand === 'add') {
            const input = args.slice(1).join(' ');
            const separatorIndex = input.indexOf('|');
            
            if (separatorIndex === -1 || !input) {
                await client.sendMessage(chatId, {
                    text: `❌ *Invalid Format*\n\nUse: .notes add title|content\nExample: .notes add Shopping|Milk, eggs, bread`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const title = input.substring(0, separatorIndex).trim();
            const content = input.substring(separatorIndex + 1).trim();

            if (!title) {
                await client.sendMessage(chatId, {
                    text: '❌ Title cannot be empty!',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const newNote = addNote(title, content);
            
            if (newNote) {
                await client.sendMessage(chatId, {
                    text: `✅ *Note Added Successfully*\n\n📝 *Title:* ${title}\n🆔 *ID:* ${newNote.id}\n\nUse .notes view ${newNote.id} to view it.`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: '❌ Failed to add note. Please try again.',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
            return;
        }

        // ===== LIST NOTES =====
        if (subCommand === 'list') {
            const notes = getNotes();
            
            if (notes.length === 0) {
                await client.sendMessage(chatId, {
                    text: '📭 *No notes found*\n\nUse .notes add to create your first note!',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            let listText = `📋 *ALL NOTES (${notes.length})*\n\n`;
            notes.forEach((note, index) => {
                listText += `${index + 1}. *${note.title}*\n`;
                listText += `   🆔 ID: ${note.id} | 📅 ${new Date(note.createdAt).toLocaleDateString()}\n`;
                listText += `   ${note.content ? note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '') : '_No content_'}\n\n`;
            });
            listText += `> Use .notes view [id] to see full note`;

            // Split if too long
            if (listText.length > 4000) {
                await client.sendMessage(chatId, {
                    text: `📋 *ALL NOTES (${notes.length})*\n\nToo many notes to display. Use .notes view [id] to see specific notes.`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: listText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
            return;
        }

        // ===== VIEW NOTE =====
        if (subCommand === 'view') {
            const id = parseInt(args[1]);
            
            if (isNaN(id)) {
                await client.sendMessage(chatId, {
                    text: '❌ Please provide a valid note ID.\nExample: .notes view 1',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const note = getNote(id);
            
            if (!note) {
                await client.sendMessage(chatId, {
                    text: `❌ Note with ID ${id} not found.`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            await client.sendMessage(chatId, {
                text: formatNote(note),
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // ===== DELETE NOTE =====
        if (subCommand === 'delete' || subCommand === 'del' || subCommand === 'remove') {
            const id = parseInt(args[1]);
            
            if (isNaN(id)) {
                await client.sendMessage(chatId, {
                    text: '❌ Please provide a valid note ID.\nExample: .notes delete 1',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const removed = removeNote(id);
            
            if (removed) {
                await client.sendMessage(chatId, {
                    text: `✅ Note with ID ${id} has been deleted.`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: `❌ Note with ID ${id} not found.`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
            return;
        }

        // ===== SEARCH NOTES =====
        if (subCommand === 'search') {
            const keyword = args.slice(1).join(' ').toLowerCase();
            
            if (!keyword) {
                await client.sendMessage(chatId, {
                    text: '❌ Please provide a search keyword.\nExample: .notes search meeting',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const notes = getNotes();
            const results = notes.filter(note => 
                note.title.toLowerCase().includes(keyword) || 
                (note.content && note.content.toLowerCase().includes(keyword))
            );

            if (results.length === 0) {
                await client.sendMessage(chatId, {
                    text: `🔍 No notes found matching "${keyword}"`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            let searchText = `🔍 *SEARCH RESULTS* (${results.length})\n\n`;
            results.forEach((note, index) => {
                searchText += `${index + 1}. *${note.title}* (ID: ${note.id})\n`;
            });
            searchText += `\n> Use .notes view [id] to see full note`;

            await client.sendMessage(chatId, {
                text: searchText,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // ===== CLEAR ALL NOTES (OWNER ONLY) =====
        if (subCommand === 'clear') {
            const isUserOwner = await isOwner(sender, client, chatId);
            if (!isUserOwner && !isOwnerSimple) {
                await client.sendMessage(chatId, {
                    text: '❌ Only the bot owner can clear all notes!',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            const cleared = clearNotes();
            
            if (cleared) {
                await client.sendMessage(chatId, {
                    text: '✅ All notes have been cleared successfully.',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: '❌ Failed to clear notes.',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
            return;
        }

        // Unknown subcommand
        await client.sendMessage(chatId, {
            text: '❌ Unknown command. Use .notes for help.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Notes command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = {
    notesCommand,
    addNote,
    removeNote,
    getNotes,
    getNote,
    clearNotes,
    updateNote
};