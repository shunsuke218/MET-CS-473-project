
let express = require('express');
let bodyParer = require('body-parser');
var history = require('connect-history-api-fallback');

const app = express();
app.use(bodyParer.json({ limit: '5000mb' }));
app.set("port", 5005);
app.use(history({
    index: 'index.html'
}));

app.use("/api/tree", require("./routes/tree"));

app.use("/", express.static("client"));

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});