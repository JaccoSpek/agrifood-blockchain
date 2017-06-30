use wallet;

CREATE TABLE Users (
    ID int not null AUTO_INCREMENT PRIMARY KEY,
    USERNAME varchar(50) not null,
    PASSHASH varchar(255) not null,
    PASSALT varchar(255) not null
);

CREATE TABLE Identities (
    USER_ID int not null,
    IDENTITY varchar(255) not null,
    PRIMARY KEY (USER_ID,IDENTITY),
    FOREIGN KEY (USER_ID) REFERENCES Users(ID)
);