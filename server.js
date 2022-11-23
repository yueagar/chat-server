const WebSocket = require("ws");
const express = require("express");
const https = require("https");
const readline = require("readline");

const Writer = require("./writer.js");
const Reader = require("./reader.js");

const fs = require("fs");
const logger = require("./logger.js");

const PORT = 2555;

const app = express()
	.use("/", express.static("public"))
	.listen(PORT, () => logger.log("Listening on port " + PORT))
	
/*const app = https.createServer({
    cert: fs.readFileSync("./cert.pem"),
    key: fs.readFileSync("./key.pem")
}).listen(PORT, () => logger.log("Listening on port " + port));*/

let online = 0;
let id = 0;
let max = 20;

let users = new Map();

class User {
	constructor(id, ws) {
		this.id = id,
		this.ws = ws,
		this.nick = ""
	}
};

function send(msg, type) {
    let data;
    switch(type) {
        case "broadcast": 
            let string = msg;
            data = new Writer(2 + string.length);
            data.writeUint8(0);
            data.writeString(string);
            wss.broadcast(data.buffer);
            break;
        case "full":
            data = new Writer(1);
            data.writeUint8(1);
            userWS.send(data.buffer);
			userWS.close();
            break;
        case "kick":
			let kickedID = msg;
            data = new Writer(1);
            data.writeUint8(2);
            users.get(Number(msg)).ws.send(data.buffer);
			users.get(Number(msg)).ws.close();
            break;
        default:
            break;
    };
};

logger.log("Creating Server...");
const wss = new WebSocket.Server({
    server: app
}).on("connection", ws => {
    userWS = ws;
    online++;
	id++;
    online > max && send("", "full");
	const user = new User(id, ws);
	users.set(id, user);
    ws.on("message", buffer => {
        const reader = new Reader(buffer);
        switch(reader.readUint8()) {
            case 0:
                let name = reader.readString();
				user.nick = name;
                online <= max && (logger.log(`${name} joined! [${online}/${max}]`), send(`${name} joined! [${online}/${max}]`, "broadcast"));
                break;
            case 1:
                let client = reader.readString();
                let content = reader.readString();
                logger.log(`${client}: ${content}`);
				send(`${client}: ${content}`, "broadcast");
                break;
            case 2:
                let oldNick = reader.readString();
                let newNick = reader.readString();
				user.nick = newNick;
                logger.log(`${oldNick} changed his/her name to ${newNick}.`);
				send(`${oldNick} changed his/her name to ${newNick}.`, "broadcast");
                break;
            default:
                //logger.warn("Unknown message");
                break;
        };
    });
    ws.on("close", () => {
		online--;
		online <= max && (logger.log(`${online === max ? user.nick + " failed to join because server is full!" : user.nick + " left!"} [${online}/${max}]`), send(`${online === max ? user.nick + " failed to join because server is full!" : user.nick + " left!"} [${online}/${max}]`, "broadcast"));
		users.delete(id);
		id--;
    });
});

wss.broadcast = data => {
    wss.clients.forEach(ws => {
        ws.send(data);
    });
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

setTimeout(prompt, 100);

function prompt() {
    rl.question("", str => {
        let cmd = str.split(" ");
        let arg = "";
        for(let i=1; i < cmd.length; i++) arg += " " + cmd[i];
        try {
            command(cmd[0], arg);
        } catch (err) {
            logger.error(err.stack);
        } finally {
            setTimeout(prompt, 0);
        };
    });
};

const command = (cmd, str) => {
    switch(cmd) {
        case "say":
            send(`Server:${str}`, "broadcast");
            break;
        case "stop":
            logger.log("Stopping...");
            wss.close();
            process.exit(1);
            break;
        case "kick":
			try {
				logger.log(`Kicked ${users.get(Number(str)).nick}.`);
				command("say", ` Kicked ${users.get(Number(str)).nick}.`);
				send(str, "kick");
			} catch (err) {
				logger.error("Invalid arguments! Usage: kick <id> *The user has to be existed!");
			};
			break;
		case "list":
			users.forEach(user => logger.log(`ID: ${user.id} | Nick: ${user.nick}`));
			break;
        default:
            logger.warn("Invalid command!");
            break;
    };
};