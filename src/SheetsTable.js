const { google } = require('googleapis');


module.exports = (() => {
	let authorize;
	let sheetsService;
	let driveService;
	let auth;
	function getService() {
		if (typeof sheetsService === "object" &&
			sheetsService !== null &&
			typeof driveService === "object" &&
			driveService !== null &&
			typeof auth === "object" &&
			auth !== null) {
			return Promise.resolve({
				sheetsService,
				driveService,
				auth
			});
		}
		return authorize().then(_auth => {
			auth = _auth;
			sheetsService = google.sheets({ version: 'v4', "auth": _auth });
			driveService = google.drive({ version: 'v3', "auth": _auth });
			return {
				sheetsService,
				driveService,
				auth
			};
		}).catch(() => {

		});
	}

	/**
	 * Sheets table
	 * @name SheetsTable
	 * @class
	 */
	class SheetsTable {
		constructor(config) {
			authorize = config.authorize;
		}

		/**
		 * @typedef SheetsTable~CreateTableParameter
		 * @property {String} schemaId id of schema
		 * @property {String} tableId id of table
		 * @property {String} title title of table
		 */

		/**
		 * Create schema
		 * @memberof SheetsTable
		 * @param {SheetsTable~CreateTableParameter} param parameter of creating table
		 * @return {Promise} create schema promise
		 */
		rename(param) {
			if (typeof param !== "object" || param === null) {
				param = {};
			}
			let { schemaId, tableId, title } = param;
			if (typeof schemaId !== "string") {
				return Promise.reject({
					"message": "SchemaId is not a string."
				});
			} else if (typeof tableId !== "number") {
				return Promise.reject({
					"message": "TableId is not a number."
				});
			} else if (typeof title !== "string") {
				return Promise.reject({
					"message": "Table title is not a string."
				});
			} else if (title.trim() === "") {
				return Promise.reject({
					"message": "Table title is empty."
				});
			}
			return getService().then(service => {
				if (typeof service.sheetsService !== "object" || service.sheetsService === null) {
					return Promise.reject({
						"message": "Cannot create SheetsService without OAuth2"
					});
				}
				return new Promise((resolve, reject) => {
					service.sheetsService.spreadsheets.batchUpdate({
						spreadsheetId: schemaId,
						resource: {
							requests: [{
								updateSheetProperties: {
									properties: {
										"sheetId": tableId,
										title,
										"gridProperties": {
											"rowCount": 50000,
											"columnCount": 100
										}
									},
									"fields": "*"
								}
							}]
						},
						"auth": service.auth
					}, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result.data);
						}
					});
				});

			});

		}
	}
	return SheetsTable;
})();