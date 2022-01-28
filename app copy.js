const { Client } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const fs = require('fs');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { response } = require('express');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

app.get('/', (req, res) => {
    // res.status(200).json({
    //     status: true,
    //     message: "just testing",
    // })
    res.sendFile('index.html', { root: __dirname });
})

const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});



client.on('message', msg => {
    if (msg.body == 'ping' && 'Ping') {
        msg.reply('pong...');
    } else if (msg.body == 'pong') {
        msg.reply('oke siap...');
    } else if (msg.body == 'assalamualaikum' && 'Assalamualaikum') {
        msg.reply('waalaikum salam warohmatulloh wabarokatuh');
    } else if (msg.body == 'bah') {
        msg.reply("Dalem mik");
    }
});

client.initialize();

// SOCKET IO
io.on('connection', function (socket) {
    socket.emit('message', 'Connecting....');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        // qrcode.generate(qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'OR Code Received, scan Please');
        });
    });
    client.on('ready', () => {
        socket.emit('message', 'Whatsapp Is Ready !!!');
    });
});

// Send Message




// app.post('/kirimPesan', (req, res) => {
//     const number = req.body.number;
//     const message = req.body.message;

//     client.sendMessage(number, message).then(response => {
//         res.status(200).json({
//             status: true,
//             response: response,
//         });
//     }).catch(err => {
//         res.status(500).json({
//             status: false,
//             response: err,
//         });
//     });
// });

server.listen(8082, function () {
    console.log("app running");
})