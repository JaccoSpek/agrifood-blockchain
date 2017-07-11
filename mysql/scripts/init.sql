CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    passhash VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL
);
CREATE TABLE IF NOT EXISTS identities (
    user_id INT NOT NULL,
    identity VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY(user_id, identity),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS addresses (
    user_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    PRIMARY KEY(user_id, address),
    FOREIGN KEY (user_id) REFERENCES users(id)
);