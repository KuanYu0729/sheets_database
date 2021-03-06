const fs = require('fs');
const path = require("path");
const readline = require('readline');
const { google } = require('googleapis');
const SheetsSchema = require("./SheetsSchema");
const SheetsTable = require("./SheetsTable");
const Logger = require("./Logger");
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
/**
 * Google sheets database
 * @name SheetsDataBase
 * @class
 * @property {String} credentialsPath credential path
 * @property {String} tokenPath token path
 */
class SheetsDataBase {
	authorize(credentialsPath) {
		if (typeof this.authPromise === "undefined") {
			if (typeof credentialsPath !== "string") {
				return Promise.reject({
					"message": "Credentials config path is undefined."
				});
			}
			this.authPromise = new Promise((resolve, reject) => {

				this.credentialsPath = credentialsPath;
				this.tokenPath = path.join(path.dirname(credentialsPath), "token.json");
				if (!fs.existsSync(this.credentialsPath)) {
					reject({
						"message": "Cannot find credentials config: " + this.credentialsPath
					});
					return;
				}
				// Load client secrets from a local file.
				let content = fs.readFileSync(this.credentialsPath, {
					"encoding": "utf-8"
				});

				// Authorize a client with credentials, then call the Google Sheets API.
				let credentials = JSON.parse(content);
				const {
					client_secret,
					client_id,
					redirect_uris
				} = credentials.installed;
				const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

				return new Promise(resolve => {
					/**
					 * Get and store new token after prompting for user authorization, and then
					 * execute the given callback with the authorized OAuth2 client.
					 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
					 * @param {getEventsCallback} callback The callback for the authorized client.
					 * @return {void}
					 */
					let getNewToken = oAuth2Client => {
						const authUrl = oAuth2Client.generateAuthUrl({
							"access_type": 'offline',
							"scope": SCOPES,
						});
						console.log('Authorize this app by visiting this url:', authUrl);
						return new Promise((resolve) => {
							const rl = readline.createInterface({
								input: process.stdin,
								output: process.stdout,
							});
							rl.question('Enter the code from that page here: ', code => {
								rl.close();
								oAuth2Client.getToken(code, (err, token) => {
									if (err) {
										Logger.error('Error while trying to retrieve access token', err);
										return getNewToken(oAuth2Client);
									}
									oAuth2Client.setCredentials(token);
									// Store the token to disk for later program executions
									fs.writeFile(this.tokenPath, JSON.stringify(token), (err) => {
										if (err) return Logger.error(err);
										Logger.log('Token stored to', this.tokenPath);
									});
									resolve(oAuth2Client);
								});
							});
						});

					}
					if (fs.existsSync(this.tokenPath)) {
						resolve({
							"tokenPath": this.tokenPath
						});
						return;
					}
					getNewToken(oAuth2Client).then(() => {
						return ({
							"tokenPath": this.tokenPath
						});
					});
				}).then(result => {
					let { tokenPath } = result;
					let token = fs.readFileSync(tokenPath);
					oAuth2Client.setCredentials(JSON.parse(token));
					resolve(oAuth2Client);
				});
			});
		}
		return new Promise((resolve, reject) => {

			this.authPromise.then(resolve, reject);
		}).catch(error => {
			Logger.error(error);
		});
	}

}



module.exports = {
	"getInstance": function(credentialsPath) {
		let db = new SheetsDataBase();
		db.authorize(credentialsPath);
		db.Schema = new SheetsSchema({
			"authorize": db.authorize.bind(db)
		});
		db.Table = new SheetsTable({
			"authorize": db.authorize.bind(db)
		});
		return db;
	}
};