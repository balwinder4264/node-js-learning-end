const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose")
const feedRoutes = require('./routes/feed');
const multer = require('multer');
const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

//stror image in the folder with multer

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"))


app.use('/images', express.static(path.join(__dirname, "images")))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/feed', feedRoutes);
//error handling middleware 
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message })
})

mongoose.connect("mongodb://127.0.0.1:27017/test").then(result => {
    app.listen(8080);
}).catch(err => console.log(err))

