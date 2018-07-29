const DB = {
    mongo: "YOUR_MLAB_CONNECTION_ADDRESS",
    local: "mongodb://localhost:27017/YOUR_MONGODB_COLLECTION"
}

const S3Bucket = {
    prod: 'YOUR_PRODUCTON_BUCKET_NAME',
    dev: 'YOUR_DEV_BUCKET_NAME'
}

module.exports = {
    DB_CONNECTION: DB.local || DB.mongo,
    AWS: {
        config: {
            accessKeyId: 'YOUR_AWS_KEY_ID',
            secretAccessKey: 'YOUR_SECRET_KEY'
        },
        bucketName: S3Bucket.prod || S3Bucket.dev
    }
}
