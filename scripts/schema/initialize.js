const path = require("path");
let credentialsPath = path.join(__dirname, "../../config/credentials.json");
const SheetsDataBase = require("../../src/SheetsDataBase").getInstance(credentialsPath);
const ROOT_PATH = path.join(__dirname, "../../");
const DATABASE_CONFIG_PATH = path.join(ROOT_PATH, "database/database.json");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(DATABASE_CONFIG_PATH);
const db = low(adapter);
db.defaults({ "database": {} }).write();
let databaseList = ["Heroku Database"];
databaseList.reduce((promise, dbName) => {
	return promise.then(() => {
		return new Promise((resolve, reject) => {
			let orgDB = db.get("database").get(dbName).value();
			if (typeof orgDB === "object" && orgDB !== null) {
				resolve();
				return;
			}
			SheetsDataBase.Schema.create({
				"title": dbName
			}).then(info => {
				db.get("database")
					.set(info.title, info)
					.write();
				resolve();
			}, reject);
		});
	});
}, Promise.resolve()).catch(error => {
	console.error(error);
});
