const express = require('express');
const router = express.Router();

const FileModel = require('../models/file');
const configs = require('../configs');

const filesize = require('filesize');
const AWS = require('aws-sdk');

AWS.config.update(configs.AWS.config);
const s3 = new AWS.S3();

////// FileQ Routes //////
router.get('/fileQ', (req, res) => {
    FileModel.find({}, (err, files) => {
        res.render('index', { files: files });
    });
});

router.post('/fileQ', (req, res) => {
    let fileContent = req.body.content.match(/data:(.*);base64,(.*)/);
    let createBody = {
        size: filesize(req.body.size),
        title: req.body.title
    };

    FileModel.create(createBody, (err, newFile) => {
        if (err) {
            console.log(err);
            return res.redirect('/error');
        }

        s3.upload({
            Bucket: configs.AWS.bucketName,
            Key: newFile.id,
            Body: new Buffer(fileContent[2], 'base64'),
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: fileContent[1]
        }, (err, data) => {
            if (err) return console.log(err);

            newFile.set({ s3Link: data.Location });
            newFile.save();
            res.status(200).json({ status: "File added", fileId: newFile.id });
        });
    });
});

router.put('/fileQ/:id', (req, res) => {
    var fileContent = req.body.content.match(/data:(.*);base64,(.*)/);
    delete req.body.content;

    FileModel.findById(req.params.id, (err, foundFile) => {
        if (err) {
            console.log(err);
            return res.redirect('/error');
        }
        if (!foundFile) {
            console.log("File", req.params.id, "not found...");
            return res.redirect('/fileQ');
        }

        s3.upload({
            Bucket: configs.AWS.bucketName,
            Key: foundFile.id,
            Body: new Buffer(fileContent[2], 'base64'),
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: fileContent[1]
        }, (err, data) => {
            if (err) return console.log(err);

            foundFile.set({
                size: filesize(req.body.size),
                editTime: Date.now()
            });
            foundFile.save();
            res.status(200).json({ status: "Edit complete", fileId: foundFile.id });
        });
    });
});

router.delete('/fileQ/:id', (req, res) => {
    console.log("DELETE", req.params.id);
    FileModel.findByIdAndRemove(req.params.id, (err) => {
        res.status(200).json({ status: "Delete complete" });
    });
});

module.exports = router;
