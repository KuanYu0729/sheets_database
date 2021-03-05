const path = require("path");
const SheetsDataBase = require("./SheetsDataBase");
let credentialsPath = path.join(__dirname, "./config/credentials.json");
new SheetsDataBase().authorize(credentialsPath);