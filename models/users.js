var mongoose=require("mongoose");
var ee = require('../events');

var userSchema=new mongoose.Schema({
	name: String,
	lat: Number,
	lng: Number,
	ttl: Number
});

userSchema.methods.updatePosition = function(lat, lng, callback){
	this.lat = lat;
	this.lng = lng;
	this.ttl = Date.now() + 3600000;
	this.save(function(){
		ee.emit('updatePosition', this.emitted.complete[0]._id); //send the _id of the object that fired the event
		callback.call();
	});
};

mongoose.model('User', userSchema);