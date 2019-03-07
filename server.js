require("dotenv").config();
let express = require('express');
let bodyParer = require('body-parser');
var history = require('connect-history-api-fallback');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(bodyParer.json({ limit: '5000mb' }));
app.set("port", 5005);
// app.use(history({
//     index: 'index.html'
// }));

app.use("/", express.static("web"));

// connect mongodb
(async function () {

    const url = process.env.MONGO_URI;
    const client = new MongoClient(url, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();
        const db = client.db(process.env.DB);

        app.use((req, res, next) => {
            req.db = db;
            next();
        })


    } catch (err) {
        console.log(err.stack);
    }

    app.use("/api/tree", require("./routes/tree"));

    app.listen(app.get("port"), () => {
        console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
    });

})();

