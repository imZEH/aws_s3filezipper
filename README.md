# Amazon S3 downloader that can download specific files from different path on AWS S3 and Zip it.

##How do i use it?
```
var S3FileZipper = require('./index');

var option = {
    apiVersion: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    s3_bucket: ''
}

var filedownload = new S3FileZipper(option);

var imagesArr = ['public/person/imahe1.jpg','public/products/imahe2.jpg'];

filedownload.downloadFiles(imagesArr, "./test", "test.zip", function(err, resp){
	if(err)
		console.log(err);

	console.log(resp);
});
