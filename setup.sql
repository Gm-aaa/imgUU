

CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    oauth_provider TEXT NOT NULL,
    oauth_id TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS  session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS  storage_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id TEXT NOT NULL, 
    provider TEXT NOT NULL,
    bucket_name TEXT NOT NULL,
    config TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS  websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id TEXT NOT NULL, 
    storage_id INTEGER NOT NULL,  
    domain TEXT NOT NULL UNIQUE, 
    cdn_domain TEXT,
    path_template TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS  uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id TEXT NOT NULL,
    website_id INTEGER NOT NULL, 
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




