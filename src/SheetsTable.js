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
				service.sheetsService.spreadsheets.get({
					"spreadsheetId": schemaId,
					"auth": service.auth
				}, (err, result) => {
					if (err) {
						reject(err);
					} else {
						tableId;
						let sheets = result.data.sheets;
						if (!Array.isArray(sheets)) {
							sheets = [];
						}
						for (let i = 0; i < sheets.length; i += 1) {
							let sheet = sheets[i];
							if (typeof sheet !== "object" || sheet === null || typeof sheet.properties !== "object" || sheet.properties === null) {
								continue;
							}
							if (sheet.properties.sheetId === tableId) {
								resolve({
									title: sheet.properties.title,
									index: sheet.properties.index,
									id: sheet.properties.sheetId
								});
							}
						}
						resolve();
					}
				});
			})
				.then(sheet => {
					let { title } = sheet;
					return new Promise((resolve, reject) => {
						service.sheetsService.spreadsheets.values.batchGet({
							"spreadsheetId": schemaId,
							"ranges": [`'${title}'`],
							"auth": service.auth
						}, (err, result) => {
							if (err) {
								reject(err);
							} else {
								let values = result.data.valueRanges[0].values;
								let rowLength;
								if (Array.isArray(values) && values.length > 0) {
									rowLength = values.length;
									values = values[0];
								} else {
									rowLength = 0;
									values = [];
								}
								sheet.cellList = values;
								sheet.rowLength = rowLength + 1;
								resolve(sheet);
							}
						});
					});
				})
				.then(sheet => {
					let { title, cellList } = sheet;

					return new Promise((resolve, reject) => {
						let rawData;
						if (Array.isArray(data)) {
							rawData = data;
						} else {
							rawData = [data];
						}
						let newCellList = [].concat(cellList);
						newCellList = rawData.reduce((cellList, data) => {
							return cellList.concat(cellList, Object.keys(data)).filter((cell, index, arr) => {
								return arr.indexOf(cell) === index;
							});
						}, newCellList);
						
						if (cellList.length === newCellList.length) {
							resolve(cellList);
							return;
						}
						service.sheetsService.spreadsheets.values.update({
							"spreadsheetId": schemaId,
							// Or where you need the data to go
							"range": `'${title}'!A1:1`,
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
					}).then(cellList => {
						sheet.cellList = cellList;
						return sheet;
					});
				})
				// update title
				.then(sheet => {
					let { title, cellList, rowLength } = sheet;
					let values = [];
					let rawData;
					if (Array.isArray(data)) {
						rawData = data;
					} else {
						rawData = [data];
					}
					for (let i = 0; i < rawData.length; i += 1) {
						let row = [];
						for (let j = 0; j < cellList.length; j += 1) {
							let cell = cellList[j];
							if (typeof rawData[i][cell] === "undefined" || rawData[i][cell] === null) {
								row.push(null);
							} else {
								row.push(rawData[i][cell]);
							}
						}
						values.push(row);
					}

					
					return new Promise((resolve, reject) => {
						service.sheetsService.spreadsheets.values.update({
							"spreadsheetId": schemaId,
							// Or where you need the data to go
							"range": `'${title}'!${rowLength}:${rowLength + values.length}`,
							"valueInputOption": 'RAW',
							// "insertDataOption": "INSERT_ROWS",
							"resource": {
								values
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
	 * @typedef SheetsTable~GetTableParameter
	 * @property {String} schemaId id of schema
	 * @property {String} tableId id of table
	 */

	/**
	 * Get raw data
	 * @memberof SheetsTable
	 * @param {SheetsTable~GetTableParameter} param parameter of raw data
	 * @return {Promise} get raw data promise
	 */
	get(param) {
		if (typeof param !== "object" || param === null) {
			param = {};
		}
		let { schemaId, tableId } = param;
		if (typeof schemaId !== "string") {
			return Promise.reject({
				"message": "SchemaId is not a string."
			});
		} else if (typeof tableId !== "number") {
			return Promise.reject({
				"message": "TableId is not a number."
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
					"spreadsheetId": schemaId,
					"auth": service.auth
				}, (err, result) => {
					if (err) {
						reject(err);
					} else {
						tableId;
						let sheets = result.data.sheets;
						if (!Array.isArray(sheets)) {
							sheets = [];
						}
						for (let i = 0; i < sheets.length; i += 1) {
							let sheet = sheets[i];
							if (typeof sheet !== "object" || sheet === null || typeof sheet.properties !== "object" || sheet.properties === null) {
								continue;
							}
							if (sheet.properties.sheetId === tableId) {
								resolve({
									title: sheet.properties.title,
									index: sheet.properties.index,
									id: sheet.properties.sheetId
								});
							}
						}
						resolve();
					}
				});
			})
				.then(sheet => {
					let { title } = sheet;
					return new Promise((resolve, reject) => {
						service.sheetsService.spreadsheets.values.batchGet({
							"spreadsheetId": schemaId,
							"ranges": [`'${title}'`],
							"auth": service.auth
						}, (err, result) => {
							if (err) {
								reject(err);
							} else {
								let values = result.data.valueRanges[0].values;
								let rawData = [];
								if (Array.isArray(values) && values.length > 0) {
									let cellList = values[0];
									values = values.slice(1);
									for (let i = 0; i < values.length; i += 1) {
										let data = {};
										for (let j = 0; j < cellList.length; j += 1) {
											let cid = cellList[j];
											data[cid] = values[i][j];
											if (data[cid] === "") {
												delete data[cid];
											}
										}
										rawData.push(data);

									}
								}
								resolve(rawData);
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
										"rowCount": 100000,
										"columnCount": 30
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