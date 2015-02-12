var mongoose=require("mongoose");

var userSchema=new mongoose.Schema({
	name: String,
	lat: Number,
	lng: Number
});

userSchema.methods.updatePosition = function(lat, lng, callback){
	this.lat = lat;
	this.lng = lng;
	this.save(callback);
};

mongoose.model('User', userSchema);