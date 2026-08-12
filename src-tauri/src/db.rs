use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create tasks and notes tables",
        sql: "
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                title TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        ",
        kind: MigrationKind::Up,
    }, Migration {
        version: 2,
        description: "add completed_at and daily notes",
        sql: "
            ALTER TABLE tasks ADD COLUMN completed_at TEXT;
            ALTER TABLE notes ADD COLUMN note_date TEXT NOT NULL DEFAULT '';
            UPDATE notes SET note_date = date('now') WHERE note_date = '';
        ",
        kind: MigrationKind::Up,
    }]
}
