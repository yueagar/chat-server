((e, j, t) => {
    class A {
        static init() {
            this.project = "Chat Server",
            this.version = "1.0.0",
            this.author = "YueAgar_c",
            this.set("version", this.version)
        };
        static get(target) {
            return localStorage.getItem(target);
        };
        static set(target, val) {
            localStorage.setItem(target, val);
            return localStorage.getItem(target);
        };
        static reset(target) {
            localStorage.removeItem(target);
            return localStorage.getItem(target);
        };
		static getTime() {
			let date = new Date();
			return `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
		};
    };
    class B {
        static init() {
            //this.protocol = window.location.protocol === "https:" ? "wss://" : "ws://",
            this.protocol = "ws://",
            //this.address = "yueagar.nets.hk",
            this.address = "localhost",
            this.port = 2555,
            this.connected = !1,
            this.connect()
        };
        static connect() {
            this.ws = new WebSocket(`${this.protocol}${this.address}:${this.port}`),
            this.ws.binaryType = "arraybuffer",
            this.ws.onopen = () => {
                this.onOpen()
            },
            this.ws.onmessage = (msg) => {
                this.onMessage(msg)
            },
            this.ws.onerror = () => {
                this.onError()
            },
            this.ws.onclose = () => {
                this.onClose()
            },
            logger.log("Connecting to server.")
        };
        static onOpen() {
            logger.log("Connected to server.");
			this.connected = !0;
            let name = A.get("nick") ? window.unescape(window.encodeURIComponent(A.get("nick"))) : "Unnamed";
            let data = new Writer(2 + name.length);
            data.writeUint8(0);
            data.writeString(name);
            this.send(data.dataView.buffer);
        };
        static onMessage(msg) {
			//logger.log(msg);
            const buffer = new Reader(new DataView(msg.data));
            switch (buffer.readUInt8()) {
                case 0: //broadcast msg
                    let content = decodeURIComponent(escape(buffer.readUTF8string()));
                    C.chatbox.value += "\n" + `[${A.getTime()}] ${content}`;
					C.chatbox.scrollTop = C.chatbox.scrollHeight;
                    logger.log(`[Chat] ${content}`);
					break;
				case 1: //full msg
					C.chatbox.value += "\n" + "Server is full!";
					break;
				case 2: //kicked msg
					C.chatbox.value += "\n" + "You've been kicked!";
					break;
                default:
                    //logger.warn("Unknown message.");
					break;
            };
        };
        static onError = () => {
            logger.error("Error occured!");
        };
        static onClose = () => {
            logger.log("Disconnected.");
			C.chatbox.value += "\n" + "Disconnected!";
			this.connected = !1;
        };
        static send(msg) {
            (this.ws && this.ws.readyState === WebSocket.OPEN) && this.ws.send(msg);
        };
    };
    class C {
        static init() {
            this.chatbox = t.getElementById("chatbox"),
            this.nick = t.getElementById("nick"),
			this.newNick = t.getElementById("newNick"),
			this.nickBtn = t.getElementById("submitNick"),
			this.nickVal = this.nick.value || A.get("nick") || "Unnamed",
            this.text = t.getElementById("text"),
			this.checkNick(),
            this.addEvents()
        };
		static checkNick() {
			A.get("nick") ? ($("#main").show(), $("#noNick").hide()) : ($("#main").hide(), $("#noNick").show());
		};
        static addEvents() {
            this.nick.value = A.get("nick");
            this.nick.addEventListener("change", () => {
                A.set("nick", this.nick.value);
				this.nickChange();
            });
			this.nickBtn.addEventListener("click", () => {
				A.set("nick", this.newNick.value);
				this.checkNick();
				this.nick.value = this.newNick.value;
				this.nickChange();
			});
            this.text.addEventListener("keypress", e => {
                event.keyCode === 13 && (e.preventDefault(), this.text.value != "" && this.chat());
            });
        };
        static chat() {
            let client = window.unescape(window.encodeURIComponent(this.nick.value));
            let content = window.unescape(window.encodeURIComponent(this.text.value));
            let data = new Writer(3 + client.length + content.length);
            data.writeUint8(1);
            data.writeString(client);
            data.writeString(content);
            B.send(data.dataView.buffer);
			this.text.value = "";
        };
		static nickChange() {
			let oldNick = window.unescape(window.encodeURIComponent(this.nickVal)) || "Unnamed";
            let newNick = window.unescape(window.encodeURIComponent(this.nick.value)) || "Unnamed";
            let data = new Writer(3 + oldNick.length + newNick.length);
            data.writeUint8(2);
            data.writeString(oldNick);
            data.writeString(newNick);
            B.send(data.dataView.buffer);
			this.nickVal = this.nick.value;
		};
    };
    class Writer {
        constructor(size) {
            this.dataView = new DataView(new ArrayBuffer(size)),
            this.byteOffset = 0
        };
        writeUint8(value) {
            this.dataView.setUint8(this.byteOffset++, value)
        };
        writeInt32(value) {
            this.dataView.setInt32(this.byteOffset, value, true),
            this.byteOffset += 4
        };
        writeUint32(value) {
            this.dataView.setUint32(this.byteOffset, value, true),
            this.byteOffset += 4
        };
        writeString(string) {
            for (let i = 0; i < string.length; i++) this.writeUint8(string.charCodeAt(i));
            this.writeUint8(0)
        };
    };
    class Reader {
        constructor(ue) {
            this.dataView = ue,
            this.index = 0,
            this.maxIndex = ue.byteLength
        };
        readUInt8() {
            const ue = this.dataView.getUint8(this.index, !0);
            return this.index++,
            ue
        };
        readInt8() {
            const ue = this.dataView.getInt8(this.index, !0);
            return this.index++,
            ue
        };
        readUInt16() {
            const ue = this.dataView.getUint16(this.index, !0);
            return this.index += 2,
            ue
        };
        readInt16() {
            const ue = this.dataView.getInt16(this.index, !0);
            return this.index += 2,
            ue
        };
        readUInt32() {
            const ue = this.dataView.getUint32(this.index, !0);
            return this.index += 4,
            ue
        };
        readInt32() {
            const ue = this.dataView.getInt32(this.index, !0);
            return this.index += 4,
            ue
        };
        readFloat32() {
            const ue = this.dataView.getFloat32(this.index, !0);
            return this.index += 4,
            ue
        };
        readFloat64() {
            const ue = this.dataView.getFloat64(this.index, !0);
            return this.index += 8,
            ue
        };
        readUTF8string() {
            let ue = '';
            for (; !this.endOfBuffer(); ) {
                const fe = this.readUInt8();
                if (0 === fe)
                    break;
                ue += String.fromCharCode(fe)
            }
            return ue
        };
        readEscapedUTF8string() {
            const ue = this.readUTF8string();
            return decodeURIComponent(escape(ue))
        };
        decompress() {
            const ue = new Uint8Array(this.dataView.buffer)
              , fe = this.readUInt32()
              , he = new Uint8Array(fe);
            LZ4.decodeBlock(ue.slice(5), he),
            this.dataView = new DataView(he.buffer),
            this.index = 0,
            this.maxIndex = this.dataView.byteLength
        };
        endOfBuffer() {
            return this.index >= this.maxIndex
        };
    };
    e.onload = () => {
        A.init();
        B.init();
        C.init();
        logger.log("Loading...")
    };
    e.A = A;
    e.B = B;
    e.C = C;
})(window, window.jquery, document);