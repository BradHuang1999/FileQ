const express = require('express');
const router = express.Router();

const FileModel = require('../models/file');
const configs = require('../configs');

const filesize = require('filesize');
const AWS = require('aws-sdk');

AWS.config.update(configs.AWS.config);
const s3 = new AWS.S3({
    params: {
        Bucket: configs.AWS.bucketName,
        ACL: 'public-read',
        ContentEncoding: 'base64'
    }
});

function s3UploadFile(content, fileModel) {
    let fileContent = content.match(/data:(.*);base64,(.*)/);
    return s3.upload({
        Key: fileModel.id,
        Body: new Buffer(fileContent[2], 'base64'),
        ContentType: fileContent[1],
        ContentDisposition: "attachment; filename = " + fileModel.title
    }).promise();
}

////// FileQ Routes //////
router.get('/fileQ', (req, res) => {
    FileModel.find({}, (err, files) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        res.render('index', { files: files });
    });
});

router.get('/fileQ/:id', (req, res) => {
    FileModel.findById(req.params.id, 'bucket', (err, file) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        if (!file || !file.bucket) {
            return res.status(404).send("File not found");
        }

        res.redirect(`//${file.bucket}.s3.amazonaws.com/${file.id}`);
    });
});

router.post('/fileQ', (req, res) => {
    let createBody = {
        size: filesize(req.body.size),
        title: req.body.title,
        bucket: configs.AWS.bucketName
    };

    FileModel.create(createBody, (err, newFile) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error when creating file instance');
        }

        s3UploadFile(req.body.content, newFile)
            .then(data => {
                res.status(200).send("File added successfully");
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send('S3 error when uploading file');
            });
    });
});

router.put('/fileQ/:id', (req, res) => {
    FileModel.findByIdAndUpdate(req.params.id, {
        $set: {
            size: filesize(req.body.size),
            editTime: Date.now()
        }
    }, (err, foundFile) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error when finding instance');
        }
        if (!foundFile) {
            return res.status(404).send('File not found');
        }

        s3UploadFile(req.body.content, foundFile)
            .then(data => {
                res.status(200).send("File edited successfully");
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send('S3 error when reuploading file');
            });
    });
});

router.delete('/fileQ/:id', (req, res) => {
    s3.deleteObject({ Key: req.params.id }, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(500).send('S3 error when uploading file');
        }

        FileModel.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Database when deleting file');
            }
            res.status(200).send("File deleted successfully");
        });
    });
});

module.exports = router;
