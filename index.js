var AWS = require('aws-sdk');
var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var zipFolder = require('zip-folder');

function S3FileZipper(awsConfig){
    this.initConf = awsConfig;
}

S3FileZipper.prototype.downloadFiles = function(arrImages, foldername, ZipFilename, cb) {
     var i = 1;
    var l = 0;

    var counter = 1;

    var s3 = new AWS.S3(this.initConf);
    async.each(arrImages, function(imahe, cllback) {
            //check if the file exist on S3
            s3.headObject({ Bucket: s3.config.s3_bucket, Key: imahe },
                function(err) {
                    if (err) {
                        cllback(err);
                    } else {
                        async.waterfall([
                            function(cbinner) {

                                //download specific file from S3
                                S3FileZipper.prototype.downloadS3File(s3, imahe, foldername, function(err, resp) {
                                    if (err)
                                        console.log('download file from s3 Error : ', err);

                                    console.log(l, i);
                                    if (l == i)
                                        cbinner(null, 'all assets are downloaded');

                                    i++;
                                });
                            },
                            function(result, cbinner1) {

                                //ZIP specific directory from tmp base on download assets.
                                zipFolder(foldername, ZipFilename, function(err) {
                                    if (err) {
                                        console.log('oh no!', err);
                                    } else {
                                        console.log('EXCELLENT');
                                        cbinner1(null, 'Gotcha!');
                                    }
                                });
                            }
                        ], function(err) {
                            if (arrImages.length <= counter) {
                                cb(null,'Operation Complete');
                            }
                        });

                    }
                });
            l++; // this increment l count only accepted or valid image path/directory.

        counter++;
    }, cb);
};

S3FileZipper.prototype.downloadS3File = function(s3, filename, foldername, cb) {

    var downloader = require('s3-download')(s3);
    var params = {
        Bucket: s3.config.s3_bucket, //required
        Key: filename //required
    }
    var sessionParams = {
        maxPartSize: '20MB', //default 20MB
        concurrentStreams: 5, //default 5
        maxRetries: 3, //default 3
        totalObjectSize: 1 //required size of object being downloaded
    }

    if (!fs.ensureDirSync(foldername))
        fs.mkdirsSync(foldername);

    var d = downloader.download(params, sessionParams);
    d.on('error', function(err) {
        console.log(err);
    });
    d.on('downloaded', function(dat) {
        console.log('done assets download');
        cb(null, 'success');
    });

    var w = fs.createWriteStream(foldername + "/" + path.basename(filename));
    d.pipe(w);
};

module.exports = S3FileZipper;