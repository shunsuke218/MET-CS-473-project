
let express =  require('express');
let bodyParer = require('body-parser');

const app = express();
app.use(bodyParer.json({limit: '5000mb'}));
app.set("port", 5005);

// app.use("/api/user", require("./src/routes/user"));

app.use("/", express.static("client"));

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});