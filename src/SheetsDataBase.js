const fs = require('fs');
const path = require("path");
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';



class SheetsDataBase {
	constructor(credentialsPath) {
		this.credentialsPath = credentialsPath;
		this.token_path = path.dirname(credentialsPath);
	}
	authorize() {
		if (typeof this.authPromise === "undefined") {
			this.authPromise = new Promise((resolve, reject) => {
				// Load client secrets from a local file.
				fs.readFile(this.credentialsPath, (err, content) => {
					if (err) {
						console.log('Error loading client secret file:', err);
						reject(err);
						return;
					}
					// Authorize a client with credentials, then call the Google Sheets API.
					let credentials = JSON.parse(content);
					// authorize(, listMajors);
					const { client_secret, client_id, redirect_uris } = credentials.installed;
					const oAuth2Client = new google.auth.OAuth2(
						client_id, client_secret, redirect_uris[0]);

					// Check if we have previously stored a token.
					let tokenPath = path.join(path.dirname(this.credentialsPath), "token.json");
					fs.readFile(tokenPath, (err, token) => {
						if (err) {
							return getNewToken(oAuth2Client, resolve);
						}
						oAuth2Client.setCredentials(JSON.parse(token));
						resolve(oAuth2Client);
					});
				});
			});
		}
		return new Promise((resolve, reject) => {
			this.authPromise.then(resolve, reject);
		});

	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 * @return {void}
	   */
	getNewToken(oAuth2Client, callback) {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		console.log('Authorize this app by visiting this url:', authUrl);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question('Enter the code from that page here: ', code => {
			rl.close();
			oAuth2Client.getToken(code, (err, token) => {
				if (err) return console.error('Error while trying to retrieve access token', err);
				oAuth2Client.setCredentials(token);
				// Store the token to disk for later program executions
				fs.writeFile(this.token_path, JSON.stringify(token), (err) => {
					if (err) return console.error(err);
					console.log('Token stored to', this.token_path);
				});
				callback(oAuth2Client);
			});
		});
	}

}





/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
	const sheets = google.sheets({ version: 'v4', auth });
	sheets.spreadsheets.values.get({
		spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
		range: 'Class Data!A2:E',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const rows = res.data.values;
		if (rows.length) {
			console.log('Name, Major:');
			// Print columns A and E, which correspond to indices 0 and 4.
			rows.map((row) => {
				console.log(`${row[0]}, ${row[4]}`);
			});
		} else {
			console.log('No data found.');
		}
	});
}
module.exports = SheetsDataBase;