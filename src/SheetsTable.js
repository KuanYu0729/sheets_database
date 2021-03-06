const { google } = require('googleapis');


module.exports = (() => {
	let authorize;
	let sheetsService;
	let driveService;
	function getService() {
		if (typeof sheetsService === "object" &&
			sheetsService !== null &&
			typeof driveService === "object" &&
			driveService !== null) {
			return Promise.resolve({
				sheetsService,
				driveService
			});
		}
		return authorize().then(auth => {
			sheetsService = google.sheets({ version: 'v4', auth });
			driveService = google.drive({ version: 'v3', auth });
			return {
				sheetsService,
				driveService
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
		 * @property {String} spreadsheetId id of spreadsheet
		 */

		/**
		 * Create schema
		 * @memberof SheetsTable
		 * @param {SheetsTable~CreateTableParameter} param parameter of creating table
		 * @return {Promise} create schema promise
		 */
		create(param) {
			if (typeof param !== "object" || param === null) {
				param = {};
			}
			let { spreadsheetId, title } = param;
			if (typeof spreadsheetId !== "string") {
				return Promise.reject({
					"message": "SpreadSheetId is not a string."
				});
			} else if (typeof title !== "string") {
				return Promise.reject({
					"message": "Schema title is not a string."
				});
			} else if (title.trim() === "") {
				return Promise.reject({
					"message": "Schema title is empty."
				});
			}
			return getService().then(service => {
				if (typeof service.sheetsService !== "object" || service.sheetsService === null) {
					return Promise.reject({
						"message": "Cannot create SheetsService without OAuth2"
					});
				}
				return new Promise((resolve, reject) => {
					service.sheetsService.spreadsheets.create({
						resource: {
							spreadsheetId,
							properties: {
								title
							}
						},
						fields: 'spreadsheetId'
					}, (err, spreadsheet) => {
						if (err) {
							reject(err);
						} else {
							resolve(spreadsheet);
						}
					});
				});
				
			});

		}
	}
	return SheetsTable;
})();