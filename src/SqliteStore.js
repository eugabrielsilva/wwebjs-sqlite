const fs = require('fs');
const sqlite3 = require('sqlite3');

class SqliteStore {
    constructor({filename} = {}) {
        if(!filename) throw new Error('A valid SQLite database filename is required for SqliteStore.');

        const createTableSQL = `CREATE TABLE IF NOT EXISTS wsp_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_name TEXT NOT NULL UNIQUE,
            data BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        this.db = new sqlite3.Database(filename, (err) => {
            if(err) {
                throw new Error(`Failed to connect to SQLite database: ${err.message}`);
            }

            this.db.run(createTableSQL, (err) => {
                if(err) {
                    throw new Error(`Failed to create table: ${err.message}`);
                }
            });
        });
    }

    async sessionExists(options) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(session_name) as count FROM wsp_sessions WHERE session_name = ?`, [options.session], (err, row) => {
                if(err) {
                    return reject(err);
                }
                resolve(row.count > 0);
            });
        });
    }

    async save(options) {
        const fileBuffer = fs.readFileSync(`${options.session}.zip`);

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(session_name) as count FROM wsp_sessions WHERE session_name = ?`, [options.session], (err, row) => {
                if(err) {
                    return reject(err);
                }

                if(row.count === 0) {
                    this.db.run(`INSERT INTO wsp_sessions (session_name, data) VALUES (?, ?)`, [options.session, fileBuffer], (err) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve();
                    });
                } else {
                    this.db.run(`UPDATE wsp_sessions SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE session_name = ?`, [fileBuffer, options.session], (err) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }
            });
        });
    }

    async extract(options) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT data FROM wsp_sessions WHERE session_name = ?`, [options.session], (err, row) => {
                if(err) {
                    return reject(err);
                }

                if(row) {
                    fs.writeFileSync(options.path, row.data);
                    resolve();
                } else {
                    resolve();
                }
            });
        });
    }

    async delete(options) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM wsp_sessions WHERE session_name = ?`, [options.session], (err) => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    close() {
        this.db.close((err) => {
            if(err) {
                console.error('Error closing the database:', err.message);
            }
        });
    }
}

module.exports = SqliteStore;
