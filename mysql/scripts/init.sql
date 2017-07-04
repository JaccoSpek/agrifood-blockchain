CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    passhash VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS identities (
    userId INT NOT NULL,
    identity VARCHAR(255) NOT NULL,
    PRIMARY KEY(userId, identity),
    FOREIGN KEY (userId) REFERENCES users(id)
);