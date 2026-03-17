import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database) {
  const version = db.pragma("user_version", { simple: true }) as number;

  if (version < 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  if (version < 2) {
    db.exec("DROP TABLE IF EXISTS comments");
    db.exec("DROP TABLE IF EXISTS tasks");

    db.exec(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','review','done')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
        public INTEGER DEFAULT 0,
        due_date TEXT,
        user_email TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_email) REFERENCES users(email)
      );

      CREATE TABLE comments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        task_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_email) REFERENCES users(email)
      );
    `);

    db.pragma("user_version = 2");
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export default getDb;
