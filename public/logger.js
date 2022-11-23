const logger = {
    log: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.log(`%c[${time}] [LOG] ${t}`, "color: green");
    },
    warn: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.log(`%c[${time}] [WARN] ${t}`, "color: orange");
    },
    error: t => {
        let date = new Date();
        let time = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
        console.log(`%c[${time}] [ERROR] ${t}`, "color: red");
    }
};