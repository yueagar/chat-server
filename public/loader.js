(() => {
    $("body").append(`<script src="main.js?v=${Date.now()}"></script>`);
    $("body").append(`<link rel="stylesheet" href="main.css?v=${Date.now()}" type="text/css">`);
})();