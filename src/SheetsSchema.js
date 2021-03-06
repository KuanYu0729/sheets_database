const GoogleAuthorize = require("./GoogleAuthorize");


module.exports = (() => {
	/**
	 * Sheets Schema
	 * @name SheetsSchema
	 * @class
	 */
	class SheetsSchema {

		/**
		 * @typedef SheetsSchema~CreateSchemaParameter
		 * @type {Object}
		 * @property {String} title title of schema
		 */

		/**
		 * Create schema
		 * @memberof SheetsSchema
		 * @param {SheetsSchema~CreateSchemaParameter} param parameter of creating schema
		 * @return {Promise} create schema promise
		 */
		create(param) {
			if (typeof param !== "object" || param === null) {
				param = {};
			}
			let { title } = param;
			if (typeof title !== "string") {
				return Promise.reject({
					"message": "Schema title is not a string."
				});
			} else if (title.trim() === "") {
				return Promise.reject({
					"message": "Schema title is empty."
				});
			}
			return GoogleAuthorize.getService().then(service => {
				if (typeof service.sheetsService !== "object" || service.sheetsService === null) {
					return Promise.reject({
						"message": "Cannot create SheetsService without OAuth2"
					});
				}
				return new Promise((resolve, reject) => {
					service.sheetsService.spreadsheets.create({
						resource: {
							properties: {
								title
							}
						}
					}, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result.data);
						}
					});
				}).then(info => {
					return {
						"id": info.spreadsheetId,
						"title": info.properties.title,
						"url": info.spreadsheetUrl,
						"sheets": info.sheets.map(info => {
							return {
								"index": info.properties.index,
								"id": info.properties.sheetId,
								"title": info.properties.title
							};
						})
					};
				});

			});

		}

		/**
		 * @typedef SheetsSchema~GetSchemaParameter
		 * @type {Object}
		 * @property {String} schemaId id of schema
		 */

		/**
		 * Get schema
		 * @memberof SheetsSchema
		 * @param {SheetsSchema~GetSchemaParameter} param parameter of getting schema
		 * @return {Promise} get schema promise
		 */
		get(param) {
			if (typeof param !== "object" || param === null) {
				param = {};
			}
			let { schemaId } = param;
			if (typeof schemaId !== "string") {
				return Promise.reject({
					"message": "SchemaId is not a string."
				});
			}
			return GoogleAuthorize.getService().then(service => {
				if (typeof service.sheetsService !== "object" || service.sheetsService === null) {
					return Promise.reject({
						"message": "Cannot create SheetsService without OAuth2"
					});
				}
				return new Promise((resolve, reject) => {
					service.sheetsService.spreadsheets.get({
						spreadsheetId: schemaId,
						auth: service.auth
					}, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result.data);
						}
					});
				}).then(info => {
					return {
						"id": info.spreadsheetId,
						"title": info.properties.title,
						"url": info.spreadsheetUrl,
						"sheets": info.sheets.map(info => {
							return {
								"index": info.properties.index,
								"id": info.properties.sheetId,
								"title": info.properties.title
							};
						})
					};
				});

			});

		}
	}
	return SheetsSchema;
})();