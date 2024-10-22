DROP TABLE IF EXISTS user_fridge_access;
DROP TABLE IF EXISTS fridge_contents;
DROP TABLE IF EXISTS fridges;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS food_items;


CREATE TABLE users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE fridges (
    fridgeID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_fridge_access (
    userID INTEGER NOT NULL,
    fridgeID INTEGER NOT NULL,
    accessLevel VARCHAR(50) NOT NULL,
    PRIMARY KEY (userID, fridgeID),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (fridgeID) REFERENCES fridges(fridgeID) ON DELETE CASCADE
);

CREATE TABLE food_items (
    itemID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    defaultExpirationDays INTEGER
);

CREATE TABLE fridge_contents (
    contentID INTEGER PRIMARY KEY AUTOINCREMENT,
    fridgeID INTEGER NOT NULL,
    itemID INTEGER NOT NULL,
    quantity FLOAT NOT NULL,
    expirationDate DATE NOT NULL,
    addedBy INTEGER,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fridgeID) REFERENCES fridges(fridgeID) ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES food_items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (addedBy) REFERENCES users(userID) ON DELETE SET NULL
);
