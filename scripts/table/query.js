const path = require("path");
let credentialsPath = path.join(__dirname, "../../config/credentials.json");
const SheetsDataBase = require("../../src/SheetsDataBase").getInstance(credentialsPath);
const ROOT_PATH = path.join(__dirname, "../../");
const DATABASE_CONFIG_PATH = path.join(ROOT_PATH, "database/database.json");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(DATABASE_CONFIG_PATH);
const db = low(adapter);
let data = db.get("database").get("Heroku Database").value();
let { id, sheets } = data;
let sheet;
if (sheets.length > 0) {
	sheet = sheets[0];
} else {
	sheet = {};
}
SheetsDataBase.Table.get({
	"schemaId": id,
	"tableId": sheet.id
}).then(info => {
	console.log(JSON.stringify(info, null, "\t"));
}).catch(error => {
	console.error(error.message + "\n" + error.stack);
});