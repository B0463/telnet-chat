import net from "net";
let clients=[];
function createClient(socket){
    let buffer="";
    let state="login";
    let username="";
    function writePrompt(hideNewline){
        if(hideNewline){
            socket.write(username+"> ");
        }else{
            socket.write("\r\n"+username+"> ");
        }
    };
    function execute(){
        if (state==="login"){
            username=buffer;
            state="normal";
            socket.write("\r\nWelcome "+username);
            socket.write("\r\nThere are "+(clients.length-1)+" other users present.");
            socket.write("\r\n------------");
            writePrompt(false);
        }else{
            broadcast(username+"> "+buffer);
            writePrompt(true);
        }
        buffer="";
    };
    function send(message){
        socket.write("\b\b  \b\b");
        for(var i=0;i<username.length;i++){
            socket.write("\b \b\b");
        }
        socket.write(message);
        writePrompt(false);
    };
    function broadcast(message){
        clients.forEach(function(client){
            if(client.socket===socket) return;
            client.send(message);
        });
    };
    socket.on("data",function(data){
        buffer+=data.toString();
        let index=buffer.indexOf("\r\n");
        if(index!==-1&&index===buffer.length-2){
            buffer=buffer.slice(0,-2);
            execute();
        }
    });
    socket.on('end',function(){
        let i=clients.indexOf(socket);
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
}).listen(2344, ()=>{
    console.log("\033[1;32m[OK]\033[0m telnet-chat online");
});