module.exports = function(application){
	application.get('/', function(req, res){
		console.log('./app/routes/chat.js');
		application.app.controllers.chat.chat(application, req,res);
	});
}