var mongoose=require("mongoose");
var ee = require('../events');

var userSchema=new mongoose.Schema({
	name: String,
	lat: Number,
	lng: Number,
	lastUpdate: {type: Date, expires: 3600}
});

userSchema.methods.updatePosition = function(lat, lng, callback){
	this.lat = lat;
	this.lng = lng;
	this.save(function(){
		var args = arguments;
		ee.emit('updatePosition', this.emitted.complete[0]._id); //send the _id of the object that fired the event
		callback.apply(this, args);
	});
};

//hook for update date on save
userSchema.pre('save', function(next){
	this.lastUpdate = new Date;
	next();
});

mongoose.model('User', userSchema);