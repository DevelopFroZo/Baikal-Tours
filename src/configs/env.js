"use strict";

process.env.SESSION_COOKIE_MAXAGE = 7 * 24 * 60 * 60 * 1000; // 1 week
process.env.SESSION_COOKIE_SECURE = false;
process.env.SESSION_NAME = "SSID";
process.env.SESSION_SECRET = "f5t7gb643w5ft7w34879";
process.env.SESSION_TABLE_NAME = "ssids";

process.env.SALT_LENGTH = 5;
process.env.HASH_ALGORITHM = "sha512";

process.env.EMAIL_HOST = "smtp.yandex.ru";
process.env.EMAIL_PORT = 465;
process.env.EMAIL_SECURE = true;
process.env.EMAIL_AUTH_USER = "jurcssclru";
process.env.EMAIL_AUTH_PASS = "fag346i8564swegesr6ywe45ygf";
process.env.EMAIL_FROM = "jurcssclru@yandex.ru";

process.env.PRODUCTION_PORT = 4002;
