const express = require("express");
const mongoose = require("../Ex3/Ex3_Server/db/mongoose");

(bodyParser = require("body-parser")),
  (path = require("path")),
  (fs = require("fs")),
  (cors = require("cors")),
  (routers = require("./Ex3_Server/routes/routes.js"));
const port = 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  "/list",
  express.static(path.join(__dirname, "Ex3_Client/html/list.html"))
);
app.use(
  "/addMedia",
  express.static(path.join(__dirname, "Ex3_Client/html/addMedia.html"))
);
app.use(
  "/updateMedia",
  express.static(path.join(__dirname, "Ex3_Client/html/updateMedia.html"))
);

app.use(
  "/addActor",
  express.static(path.join(__dirname, "Ex3_Client/html/addActor.html"))
)

app.use("/css", express.static(path.join(__dirname, "Ex3_Client/css")));
app.use("/js", express.static(path.join(__dirname, "Ex3_Client/js")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routers);

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

