var ee = require('./events');

module.exports = function(io){
io.on('connection', function(socket){	
	ee.on('updatePosition', function(id){
		console.log(id);
	});
});
};