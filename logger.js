require("colour");

module.exports = {
    log: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.log(`[${time}] ${'[LOG]'.green} ${decodeURIComponent(escape(t))}`);
    },
    warn: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.warn(`[${time}] ${'[WARN]'.yellow} ${decodeURIComponent(escape(t))}`);
    },
    error: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.error(`[${time}] ${'[ERROR]'.red} ${decodeURIComponent(escape(t))}`);
    }
};