const express = require("express");
const process = require("process");

const app = express();
app.enable("trust proxy");
app.use(express.static(__dirname + "/"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.status(200).send("Up and running")
});

const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');
const m = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // no larger than 25mb
  }
});
const gcs = new Storage({
  projectId: 'up-and-running1',
  keyFilename: 'cloud-key.json'
});
const bucketName = 'up-and-running1.appspot.com'
const bucket = gcs.bucket(bucketName);

app.get('/img', (req, res) => {
  res.status(200).sendFile(__dirname + "/img.html")
})

app.post('/img', m.single("file"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  const blob = bucket.file(`${Date.now()}_${req.file.originalname}`);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on("error", err => {
    next(err);
    res.status(404).send('Looks like there was an error - please try again.');
  });

  blobStream.on("finish", () => {
    // Make the image public to the web (since we'll be displaying it in browser)
    blob.makePublic().then(() => {      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`)
    });
  });

  blobStream.end(req.file.buffer);
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
