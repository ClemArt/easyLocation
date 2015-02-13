var express = require('express');
var router = express.Router();

//Mongoose model load
var mongoose=require('mongoose');
var User=mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

//generic function to find an user by id
router.param('user', function(req, res, next, id){
	User.findById(id, function(err, data){
		if(err) return next(err);
		if(!data) return next(new Error('No user found with this ID'));
		
		//attach the found user to the req object
		req.user = data;
		next();
	});
});

router.get('/users', function(req, res, next){
	//Returns only users with valid ttl, to prevent unwanted informations to spread
	User.find({ttl: {$gte: Date.now()}}, function(err, data){
		if(err) return next(err);
		res.json(data);
	});
});

router.get('/users/:user', function(req, res, next){
	res.json(req.user);
});

router.post('/users', function(req, res, next){
	// add a ttl of 3600 s to user in req.body
	req.body.ttl = Date.now() + 3600000;
	var user = new User(req.body);
	//Save user to the database
	user.save(function(err, data){
		if(err) return next(err);
		res.json(data);
	});
});

router.put('/users/:user/position', function(req, res, next){
	var pos = req.body;
	req.user.updatePosition(pos.lat, pos.lng, function(err, data){
		if(err) return next(err);
		res.json(data);
	});
});

module.exports = router;
