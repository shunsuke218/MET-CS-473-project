
let express =  require('express');
let bodyParer = require('body-parser');

const app = express();
app.use(bodyParer.json({limit: '5000mb'}));
app.set("port", 80);


// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    console.log('using client/build');
    app.use("/", express.static("client/build"));
}


app.use("/api/user", require("./src/routes/user"));

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
