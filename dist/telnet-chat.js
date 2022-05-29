var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
let clients = [];
function createClient(socket) {
    let buffer = "";
    let state = "login";
    let username = "";
    function writePrompt(hideNewline) {
        if (hideNewline) {
            socket.write(username + "> ");
        }
        else {
            socket.write("\r\n" + username + "> ");
        }
    }
    ;
    function execute() {
        if (state === "login") {
            username = buffer;
            state = "normal";
            socket.write("\r\nWelcome " + username);
            socket.write("\r\nThere are " + (clients.length - 1) + " other users present.");
            socket.write("\r\n------------");
            writePrompt(false);
        }
        else {
            broadcast(username + "> " + buffer);
            writePrompt(true);
        }
        buffer = "";
    }
    ;
    function send(message) {
        socket.write("\b\b  \b\b");
        for (var i = 0; i < username.length; i++) {
            socket.write("\b \b\b");
        }
        socket.write(message);
        writePrompt(false);
    }
    ;
    function broadcast(message) {
        clients.forEach(function (client) {
            if (client.socket === socket)
                return;
            client.send(message);
        });
    }
    ;
    socket.on("data", (data) => {
        buffer += data.toString();
        let index = buffer.indexOf("\r\n");
        if (index !== -1 && index === buffer.length - 2) {
            buffer = buffer.slice(0, -2);
            execute();
        }
    });
    socket.on('end', () => {
        let i = clients.indexOf(socket);
        clients.splice(i, 1);
    });
    socket.write("\r\nWhat is your username: ");
    return {
        send: send,
        socket: socket,
        broadcast: broadcast
    };
}
;
net_1.default.createServer(function (socket) {
    clients.push(createClient(socket));
}).listen(2344);
