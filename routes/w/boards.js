var express = require('express');
var router = express.Router();
var sharedRoutes = require('./sharedRoutes');

router.get('/:docId', function(req, res, next) {	
	var docId = req.params.docId;
	sharedRoutes.renderDocumentPageBoard(req, res, docId);
});

router.post('/update', function(req, res) {
	
	var db = req.db;
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var projectId = req.body.projectId;
	var docId = req.body.boardId;
	var docsTable = db.get('boards');

	if (docId.length > 1) {
		if (docName && docName.length > 0) {
			docsTable.findAndModify({
				"query" : { "_id" : docId },
				"update" : { "name" : docName, "sortOrder" : sortOrder, "projectId" : projectId },
				"new" : true,		// no workie?
				"upsert" : false	// no workie?
			}, function(err, oldDoc) {
				sharedRoutes.renderDocumentPageBoard(req, res, docId);
			});			
		}
		else {
			docsTable.remove({ "_id" : docId }, function(err) {
				if (err) {
					res.send("There was a problem removing that document from the database.");					
				}
				else {
					sharedRoutes.renderDocumentPageProject(req, res, projectId);
				}
			});			
		}
	}
	else if (docName && docName.length > 0) {
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "projectId" : projectId }, function(err, doc) {
			if (doc) {
				sharedRoutes.renderDocumentPageBoard(req, res, doc._id);
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
	else {
		sharedRoutes.renderDocumentPageProject(req, res, projectId);
	}
});

module.exports = router;
