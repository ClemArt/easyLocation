var mongoose=require("mongoose");

var userSchema=new mongoose.Schema({
	email: String,
	lat: Number,
	lng: Number
});

mongoose.model('User', userSchema);