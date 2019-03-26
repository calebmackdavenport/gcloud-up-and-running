const express = require("express");
const process = require("process");

const app = express();
app.enable("trust proxy");
app.use(express.static(__dirname + "/"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/robots', (req, res) => {
  res.status(200).sendFile(__dirname + '/robots.txt')
});
app.get('/robots.txt', (req, res) => {
  res.status(200).sendFile(__dirname + '/robots.txt')
});

app.get("/", (req, res) => {
  res.status(200).sendFile(__dirname + '/index.html')
});

app.get("/map", (req, res) => {
  res.status(200).sendFile(__dirname + '/map.html')
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});