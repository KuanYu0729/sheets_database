const GoogleAuthorize = require("./GoogleAuthorize");

/**
 * Sheets table
 * @name SheetsTable
 * @class
 */
class SheetsTable {

	/**
	 * @typedef SheetsTable~InsertTableParameter
	 * @property {String} schemaId id of schema
	 * @property {String} tableId id of table
	 * @property {Object} data raw data
	 */

	/**
	 * Insert raw data
	 * @memberof SheetsTable
	 * @param {SheetsTable~InsertTableParameter} param parameter of raw data
	 * @return {Promise} insert raw data promise
	 */
	insert(param) {
		if (typeof param !== "object" || param === null) {
			param = {};
		}
		let { schemaId, tableId, data } = param;
		if (typeof schemaId !== "string") {
			return Promise.reject({
				"message": "SchemaId is not a string."
			});
		} else if (typeof tableId !== "number") {
			return Promise.reject({
				"message": "TableId is not a number."
			});
		} else if (typeof data !== "object" || data === null) {
			return Promise.reject({
				"message": "Table title is not a object."
			});
		}
		return GoogleAuthorize.getService().then(service => {
			if (typeof service.sheetsService !== "object" || service.sheetsService === null) {
				return Promise.reject({
					"message": "Cannot create SheetsService without OAuth2"
				});
			}
			return new Promise((resolve, reject) => {
				service.sheetsService.spreadsheets.values.batchGet({
					"spreadsheetId": schemaId,
					"ranges": ["A1:1"],
					"auth": service.auth
				}, (err, result) => {
					if (err) {
						reject(err);
					} else {
						let values = result.data.valueRanges[0].values;
						if (Array.isArray(values) && values.length > 0) {
							values = values[0];
						} else {
							values = [];
						}
						resolve(values);
					}
				});
			})
				.then(cellList => {
					let newCellList = [].concat(cellList, Object.keys(data)).filter((cell, index, arr) => {
						return arr.indexOf(cell) === index;
					});
					if (cellList.length === newCellList.length) {
						return cellList;
					}
					return new Promise((resolve, reject) => {
						service.sheetsService.spreadsheets.values.update({
							"spreadsheetId": schemaId,
							// Or where you need the data to go
							"range": `Sheet1!A1:1`,
							"valueInputOption": 'RAW',
							"resource": {
								"values": [newCellList]
							},
							"auth": service.auth

						}, (err) => {
							if (err) {
								reject(err);
							} else {
								resolve(newCellList);
							}
						});
					});
				})
				// update title
				.then(cellList => {
					let values = [];
					for (let i = 0; i < cellList.length; i += 1) {
						let cell = cellList[i];
						if (typeof data[cell] === "undefined") {
							values.push("");
						} else {
							values.push(data[cell]);
						}
					}
					return new Promise((resolve, reject) => {
						service.sheetsService.spreadsheets.values.append({
							"spreadsheetId": schemaId,
							// Or where you need the data to go
							"range": `Sheet1`,
							"valueInputOption": 'RAW',
							// "insertDataOption": "INSERT_ROWS",
							"resource": {
								"values": [values]
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

		});
	}

	/**
	 * @typedef SheetsTable~RenameTableParameter
	 * @property {String} schemaId id of schema
	 * @property {String} tableId id of table
	 * @property {String} title title of table
	 */

	/**
	 * Rename table
	 * @memberof SheetsTable
	 * @param {SheetsTable~RenameTableParameter} param parameter of rename table
	 * @return {Promise} rename table promise
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
		return GoogleAuthorize.getService().then(service => {
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

module.exports = new SheetsTable();