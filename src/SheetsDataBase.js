const GoogleAuthorize = require("./GoogleAuthorize");
const SheetsSchema = require("./SheetsSchema");
const SheetsTable = require("./SheetsTable");

module.exports = {
	"getInstance": function(credentialsPath) {
		GoogleAuthorize.authorize(credentialsPath);
		return {
			"Schema": SheetsSchema,
			"Table": SheetsTable
		};
	}
};