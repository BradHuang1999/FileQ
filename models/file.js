var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = mongoose.model('File', new Schema({
    title: String,
    size: String,
    s3Link: String,
    uploadTime: {
        type: Date,
        default: Date.now
    },
    editTime: {
        type: Date,
        default: Date.now
    }
}));