const net=require('net');
var clients=[];
var createClient=function(socket){
    var buffer="";
    var state="login";
    var username="";
    var writePrompt=function(hideNewline){
        if(hideNewline){
            socket.write(username+"> ");
        }else{
            socket.write("\r\n"+username+"> ");
        }
    };
    var execute=function(){
        if (state==="login"){
            username=buffer;
            state="normal";
            socket.write("\r\nWelcome "+username);
            socket.write("\r\nThere are "+(clients.length-1)+" other users present.");
            socket.write("\r\n------------");
            writePrompt();
        }else{
            broadcast(username+"> "+buffer,socket);
            writePrompt(true);
        }
        buffer="";
    };
    var send=function(message){
        socket.write("\b\b  \b\b");
        for(var i=0;i<username.length;i++){
            socket.write("\b \b\b");
        }
        socket.write(message);
        writePrompt();
    };
    var broadcast=function(message){
        clients.forEach(function(client){
            if(client.socket===socket) return;
            client.send(message);
        });
    };
    socket.on("data",function(data){
        buffer+=data.toString();
        var index=buffer.indexOf("\r\n");
        if(index!==-1&&index===buffer.length-2){
            buffer=buffer.slice(0,-2);
            execute();
        }
    });
    socket.on('end',function(){
        var i=clients.indexOf(socket);
        clients.splice(i,1);
    });
    socket.write("\r\nWhat is your username: ");
    return{
        send:send,
        socket:socket,
        broadcast:broadcast
    }
};
net.createServer(function(socket){
    clients.push(createClient(socket));
}).listen(8000);