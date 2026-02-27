const fs = require('fs');
const path = require('path');

// Simple JSON file-based database (works everywhere, no compilation needed)
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Simple in-memory/JSON database
const DATABASE = {
    models: {},
    
    define: function(modelName, schema, options) {
        // Create a simple model
        const model = {
            name: modelName,
            schema,
            options,
            data: [],
            filePath: path.join(dataDir, `${modelName}.json`),
            
            // Load data from file
            _load() {
                try {
                    if (fs.existsSync(this.filePath)) {
                        const fileData = fs.readFileSync(this.filePath, 'utf8');
                        this.data = JSON.parse(fileData);
                    } else {
                        this.data = [];
                        this._save();
                    }
                } catch (e) {
                    console.error(`Error loading ${modelName}:`, e);
                    this.data = [];
                }
                return this;
            },
            
            // Save data to file
            _save() {
                try {
                    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
                } catch (e) {
                    console.error(`Error saving ${modelName}:`, e);
                }
            },
            
            // Find by primary key
            async findByPk(id) {
                this._load();
                return this.data.find(item => item.id === id) || null;
            },
            
            // Find one with where clause
            async findOne(where) {
                this._load();
                if (!where || !where.where) return null;
                
                const conditions = where.where;
                return this.data.find(item => {
                    for (const [key, value] of Object.entries(conditions)) {
                        if (item[key] !== value) return false;
                    }
                    return true;
                }) || null;
            },
            
            // Find or create
            async findOrCreate(options) {
                this._load();
                const where = options.where;
                const defaults = options.defaults || {};
                
                let item = this.data.find(d => {
                    for (const [key, value] of Object.entries(where)) {
                        if (d[key] !== value) return false;
                    }
                    return true;
                });
                
                if (item) {
                    return [item, false];
                }
                
                const newItem = { ...where, ...defaults, id: Date.now().toString() };
                this.data.push(newItem);
                this._save();
                return [newItem, true];
            },
            
            // Update
            async update(updates, options) {
                this._load();
                const where = options.where;
                let count = 0;
                
                this.data = this.data.map(item => {
                    let match = true;
                    for (const [key, value] of Object.entries(where)) {
                        if (item[key] !== value) match = false;
                    }
                    if (match) {
                        count++;
                        return { ...item, ...updates };
                    }
                    return item;
                });
                
                this._save();
                return [count];
            },
            
            // Sync
            async sync() {
                this._load();
                console.log(`[♻️] Model ${modelName} synced (file-based)`);
                return true;
            }
        };
        
        model._load();
        this.models[modelName] = model;
        return model;
    },
    
    async sync() {
        console.log('[♻️] File-based database ready');
        return true;
    }
};

// Add bot_ helper for compatibility
const bot_ = {
    async findOne(query) {
        const Model = DATABASE.models['botsettings'];
        if (!Model) {
            // Create model if it doesn't exist
            DATABASE.define('botsettings', {
                id: { type: 'string', primaryKey: true },
                autoreaction: { type: 'string', defaultValue: 'false' }
            });
        }
        const result = await DATABASE.models['botsettings']?.findOne({ where: { id: query.id } });
        return result ? result : null;
    },
    
    async new(data) {
        const Model = DATABASE.models['botsettings'];
        const [item, created] = await Model.findOrCreate({
            where: { id: data.id },
            defaults: { autoreaction: 'false' }
        });
        return item;
    },
    
    async updateOne(query, updateData) {
        const Model = DATABASE.models['botsettings'];
        await Model.update(updateData, { where: { id: query.id } });
        return await Model.findOne({ where: { id: query.id } });
    }
};

async function react(msg, emoji) {
    try {
        if (msg && msg.key) {
            await msg.client.sendMessage(msg.chat, {
                react: { text: emoji, key: msg.key }
            });
        }
    } catch (e) {
        console.error('React error:', e);
    }
}

module.exports = { DATABASE, bot_, react };