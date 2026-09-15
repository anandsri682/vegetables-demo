import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

const DB_FILE = path.resolve(process.cwd(), 'freshcart.db');

let sqlDb = null;
let inTransaction = false;

export async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }
  saveDb();
  return db;
}

function saveDb() {
  if (!sqlDb || inTransaction) return;
  try {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving DB to disk:', err.message);
  }
}

export const db = {
  exec(sql) {
    if (!sqlDb) throw new Error('Database not initialized');
    sqlDb.exec(sql);
    if (!inTransaction) saveDb();
  },
  prepare(sql) {
    return {
      all(...params) {
        if (!sqlDb) throw new Error('Database not initialized');
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params) {
        const rows = this.all(...params);
        return rows.length > 0 ? rows[0] : undefined;
      },
      run(...params) {
        if (!sqlDb) throw new Error('Database not initialized');
        const stmt = sqlDb.prepare(sql);
        stmt.run(params);
        stmt.free();
        const lastIdResult = sqlDb.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = lastIdResult.length > 0 && lastIdResult[0].values.length > 0 
          ? lastIdResult[0].values[0][0] 
          : 0;
        const changesResult = sqlDb.exec('SELECT changes() as c');
        const changes = changesResult.length > 0 && changesResult[0].values.length > 0
          ? changesResult[0].values[0][0]
          : 0;
        if (!inTransaction) saveDb();
        return { lastInsertRowid, changes };
      }
    };
  },
  transaction(fn) {
    return (...args) => {
      if (inTransaction) {
        return fn(...args);
      }
      try {
        inTransaction = true;
        sqlDb.exec('BEGIN TRANSACTION;');
        const result = fn(...args);
        sqlDb.exec('COMMIT;');
        inTransaction = false;
        saveDb();
        return result;
      } catch (err) {
        try {
          sqlDb.exec('ROLLBACK;');
        } catch (e) {}
        inTransaction = false;
        throw err;
      }
    };
  }
};
