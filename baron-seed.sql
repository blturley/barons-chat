INSERT INTO users (id, username, password, email)
VALUES (1, 'testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'test@test.com'),
        (2, 'testuser2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'test2@test.com');

INSERT INTO rooms (id, roomname, roomowner, isprivate, style, invitelink)
VALUES (1, 'test room', 1, 'false', 'default', '666666');

INSERT INTO room_users (userid, roomid, nickname, namecolor, isadmin, isbanned)
VALUES (1, 1, 'eggman556', 'blue', 'true', 'false'),
       (2, 1, 'eggman556', 'red', 'false', 'false');
