const express = require("express");
const cors = require("cors");
const pg = require("pg");
const axios = require("axios");

const app = express();

require("dotenv").config();

// adnan  methodOverride => instead of app.use(methodOverride("_method"));
app.use((req, res, next) => {
  if (req.query && req.query._method){ // eslint-disable-line
    req.method = req.query._method; // eslint-disable-line
  }
  next();
});

app.use(express.static("public"));
app.use("/jokes", express.static("public"));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.set("view engine", "ejs");
const client = new pg.Client(process.env.DATABASE_URL);

// render home
app.get("/", (req, res, next) => {
  axios.get("https://official-joke-api.appspot.com/jokes/programming/ten")
    .then((response) => {
      const jokes = response.data.map((e) => new JOKE(e)); // eslint-disable-line
      res.render("home", { jokes });
    }).catch((e) => next(e));
});

// render fovorite
app.get("/favorite", (req, res) => {
  const sql = "select * from jokes order by id desc;";
  client.query(sql, []).then((result) => {
    const jokes = result.rows.map((e) => new JOKE(e)); // eslint-disable-line
    res.render("favorite", { jokes });
  });
});

// render joke id
app.get("/jokes/:id", (req, res) => {
  const { id } = req.params;
  const sql = " select * from jokes where id=$1;";
  client.query(sql, [id]).then((result) => {
    const joke = new JOKE(result.rows[0]); // eslint-disable-line
    res.render("joke", { joke });
  });
});

// render random joke
app.get("/random", (req, res, next) => {
  axios.get("https://official-joke-api.appspot.com/jokes/programming/ten")
    .then((response) => {
      const joke = new JOKE(response.data[0]); // eslint-disable-line
      res.render("random", { joke });
    }).catch((e) => next(e));
});

app.put("/jokes/:id", (req, res) => {
  const { id } = req.params;
  const {
    type, setup, punchline,
  } = req.body;
  const sql = "update jokes set type=$1, setup=$2, punchline=$3 where id =$4;";
  client.query(sql, [type, setup, punchline, id]).then(() => {
    res.redirect(`/jokes/${id}`);
  });
});

app.delete("/jokes/:id", (req, res) => {
  console.log("delete");
  const { id } = req.params;
  const sql = "delete from jokes where id =$1;";
  client.query(sql, [id]).then(() => {
    res.redirect("/favorite");
  });
});

app.post("/jokes", (req, res) => {
  const {
    number, type, setup, punchline,
  } = req.body;
  const sql = "insert into jokes(id, type, setup, punchline) values($1, $2, $3, $4);";
  client.query(sql, [number, type, setup, punchline]).then(() => {
    res.redirect("/favorite");
  });
});

app.put("/jokes/:id", (req, res) => {
  const {
    number, type, setup, punchline,
  } = req.body;
  const sql = "insert into jokes(id, type, setup, punchline) values($1, $2, $3, $4);";
  client.query(sql, [number, type, setup, punchline]).then(() => {
    res.redirect("/favorite");
  });
});

client.connect().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("http server is running on port", PORT);
  });
});

app.all("*", (req, res) => {
  res.status(404).send({ msg: "page not found" });
});

app.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).send({ msg: err.message });
});

// constructor
function JOKE(data) {
  this.number = data.number || data.id;
  this.type = data.type;
  this.setup = data.setup;
  this.punchline = data.punchline;
}
