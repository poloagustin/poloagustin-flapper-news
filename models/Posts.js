/// <reference path="../typings/mongoose/mongoose.d.ts" />

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: {type: String, default: 'NO TITLE'},
	link: String,
	upvotes: {type: Number, default: 0},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

PostSchema.methods.upvote = function (cb) {
	this.upvotes += 1;
	this.save(cb);
};

mongoose.model('Post', PostSchema);
