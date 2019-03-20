const express = require("express");
const process = require("process");

const credentials = require(`./key.json`);
const GoogleSpreadsheet = require('google-spreadsheet');
const {promisify} = require('util');

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
  res.status(200).send("Up and running")
});

app.get("/sheets", (req, res) => {
  try{
    (async () => {
      res.status(200).send(await getSpreadsheet())
    })()
  }
  catch (e) {
    res.status(404).send(e)
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

async function getSpreadsheet() {
  const doc = new GoogleSpreadsheet(`1fOKdATKiouA3AIhuiuxerYA7meDVqfVq1uFvSEB3AGs`)
  await promisify(doc.useServiceAccountAuth)(credentials)

  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[0]
  
  const cells = await promisify(sheet.getCells)({
    'min-row': 1,
    'max-row': 10,
    'min-col': 1,
    'max-col': 1,
    'return-empty': true,
  })

  for (var x = 0; x < cells.length; x++) {
    if (!cells[x].value) {
      cells[x].value = "Now I'm writing";
      break
    }
  }
  await sheet.bulkUpdateCells(cells);

  var response = ""
  for (var x = 0; x < cells.length; x++) {
    if (cells[x].value)
      response += cells[x].value + " "
    else break
  }
  return response;
}