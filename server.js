var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

const array = ["hola"];

http.listen(1337, function () {
    console.log('escuchando en *:1337');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/error', function (req, res) {
    res.sendFile(__dirname + '/error.html');
});

const createFile = (fileName) => {
    fs.open(fileName, 'w', function (err, file) {
        if (err) throw err;
        console.log('Creado!');
    });
}

createFile('./logs/log1.txt');
createFile('./logs/log2.txt');
createFile('./logs/log3.txt');
createFile('./logs/log4.txt');

io.on('connection', function (socket) {
    socket.on('chat message', function (msg, sala) {
        let fileName = './logs/log' + sala + '.txt';
        if (sala > 0 && sala < 5) {
            if (msg.length <= 140) {
                msg = filter(msg);
                io.emit('chat message' + sala, msg);
                addMsg(fileName, msg, sala);
            }
        }
        else {
            io.to(socket.id).emit('error', sala);
        }
    });

    socket.on('load', function (sala) {
        let fileName = './logs/log' + sala + '.txt';
        writeLogs(fileName, sala);
    });
});

const filter = (msg) => {
    array.forEach(function (x) {
        msg = msg.replace(new RegExp("\\b" + x + "\\b", "gi"), "*".repeat(x.length));
    });
    return msg;
}

const addMsg = (fileName, msg, sala) => {
    fs.appendFile('logs/log' + sala + '.txt', msg + "\r\n", function (err) {
        if (err) throw err;
    });
}

const writeLogs = (fileName, sala) => {
    var array = fs.readFileSync(fileName, "utf-8").toString().split("\n");
    console.log(array);
    array.forEach(function (x) {
        io.emit('load' + sala, x);
    });
}




