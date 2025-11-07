-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    name_kana TEXT,
    old INTEGER,
    sex TEXT,
    setting JSON
);

-- Create place table
CREATE TABLE IF NOT EXISTS place (
    id SERIAL PRIMARY KEY,
    name TEXT,
    name_kana TEXT,
    address TEXT,
    lat TEXT,
    lon TEXT,
    url TEXT,
    tel TEXT
);
