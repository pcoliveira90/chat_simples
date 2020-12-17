/* importar server */
var WebSocketServer  = require('ws').Server;

/* instancia */
var server = new WebSocketServer({port:5001});

/* clientes conectados*/
var clients = [];

/* nickname já utilizado */
var login= [];

server.on('connection', function(ws) {
    let message;

    
    ws.send(JSON.stringify({status: "OK",payload:{listUser: login,message : 'Welcome to the chat, enjoy :)'}}));

    ws.on('message', (data) => {
        try {
            message = JSON.parse(data);
        } catch (e) {
            sendError(ws, 'Wrong format');
            return;
        }
        //mensagem
        if (message.type === 'NEW_MESSAGE')
            sendMessage(message,ws);

        //login
        if (message.type === 'NEW_USER'){
            var nickname = message.nickname;

            if(login.includes(nickname)){
                sendRegError(ws, 'Sorry, the nickname <b>'+message.nickname+'</b> is already taken. Please choose a different one.');
                return;
            }else{
                login.push(message.nickname);
                ws.username = message.nickname;
                clients.push(ws);
                sendInit(ws);
                sendAllAlert ('<b>'+message.nickname+'</b> has joined.');
                console.log(login);
            }
        }
        //sair
        if (message.type === 'EXIT_ROOM'){
            var author = message.nickname;

            if(login.includes(author)){
                login.pop(message.nickname)
                ws.username = message.nickname;
                clients.pop(ws);
                sendAllAlert ('<b>'+message.nickname+'</b> disconected.');
                sendRegError(ws, 'The nickname <b>'+message.nickname+'</b> disconected. Bye!');
                return;
            }
        }

    });
    
    ws.on('close', (obj) =>{
        console.log('aqui  '+obj)
    });

    ws.on('error', (data) => {
      console.log('aqui s')
  });
})
function sendRegError(ws, _message) {
    let env ={
        status: "NOK_REG",
        payload:{listUser: login, message : _message}
    }
    ws.send(JSON.stringify(env));
};

function sendError (ws, _message) {
    let env ={
        status: "NOK",
        payload:{listUser: login,message : _message}
    }
    console.log(env);
    ws.send(JSON.stringify(env));
};

function sendInit (ws){
    let env ={
        status: "OK",
        payload:{listUser: login,message : 'You are registered as '+ws.username+'.'}
    }
    ws.send(JSON.stringify(env));
};
function sendMessage(_message, ws){
    
    if(_message.privacy ==true){
        sendSpecific (_message,ws);
    }else{
        sendAll (_message,ws);
    }
}
function sendSpecific (_message,ws) {
    let env ={
        status: "OK",
        payload:{listUser: login,message : '<b>'+ _message.nickname+'</b> says to <i>'+ _message.receiver +'</i> : '+_message.message}
    }
    clients.forEach((client) => {
        if (client.readyState === 1 && client.username === _message.receiver) {
            client.send(JSON.stringify(env));
            ws.send(JSON.stringify(env));
        }
    });
}
function sendAll (_message,ws) {
    let env ={
        status: "OK",
        payload:{listUser: login,message :'<b>'+ _message.nickname+'</b> says to <i>'+ _message.receiver +'</i> : '+_message.message}
    }

    clients.forEach((client) => {
    if (client.readyState ===1) 
        client.send(JSON.stringify(env));
    });
}

function sendAllAlert (_message) {
    let env ={
        status: "OK",
        payload:{listUser: login,message : _message}
    }
    clients.forEach((client) => {
        if (client.readyState ===1) {
            client.send(JSON.stringify(env));
        }
    });
}

module.exports = server;

  