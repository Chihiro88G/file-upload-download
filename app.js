import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// where to store image and what the file name should be
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    callback(null, file.filename + '-' + file.originalName);
  } 
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// has to be used as a function.
// single() to receive a single file with the name of the image
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

// to statically serve images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'index.html');
  res.sendFile(filePath);
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'images', filename);
  
  // check if the file exists in file system
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    
    // send the file as a response
    res.download(filePath, filename, (err) => {
      if (err) {
        return res.status(500).send('Error downloading file');
      }
    });
  });
});

app.post('/upload', (req, res) => {
  const image = req.file;
  if (!image) res.status(422).send('Attached file is not an image');

  console.log(image);
  // output obj
  // {
  //   fieldname: 'image',
  //   originalname: 'ripple3.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: 'images',
  //   filename: 'undefined-undefined',
  //   path: 'images/undefined-undefined',
  //   size: 199839
  // }

  // image file itself: stored in file system
  // image file path: to be stored in db
  const imageUrl = image.path;

  res.status(200).send('Image was uploaded!');
});

app.listen(3100, () => console.log('app running on 3100'));