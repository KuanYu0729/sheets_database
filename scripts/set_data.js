const path = require("path");
let credentialsPath = path.join(__dirname, "../config/credentials.json");
const SheetsDataBase = require("../src/SheetsDataBase").getInstance(credentialsPath);
const ROOT_PATH = path.join(__dirname, "../");
const DATABASE_CONFIG_PATH = path.join(ROOT_PATH, "database/database.json");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(DATABASE_CONFIG_PATH);
const db = low(adapter);
let data = db.get("database").get("Heroku Database").value();
let { spreadsheetId } = data;
SheetsDataBase.Table.create({
	spreadsheetId,
	"title": "test"
});