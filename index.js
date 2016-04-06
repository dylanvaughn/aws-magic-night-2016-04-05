console.log('Loading function');

var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var im = require('imagemagick');
// var tmp = require('tmp');
var fs = require('fs');
var twit = require('twitter');

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('uri:', key);
    var params = {
        Bucket: bucket,
        Key: key
    };
    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object " + key + " from bucket " + bucket +
                ". Make sure they exist and your bucket is in the same region as this function.";
            console.log(message);
            context.fail(message);
        } else {
            // write data to /tmp
            // create temporary directory
            // var tmpobj = tmp.dirSync();
            var twitter = new twit({
                consumer_key:'V7Xe7mYh98qWecxWMDkwc2C14',
                consumer_secret:'auSHBcdMSdy6t4YwE6J7SUpOh7WNsTYURWsP44hpsMEUlbDigH',
                access_token_key:'717535943167619072-fj1hrhGU96JClWZ1zSMl8GDls3qIsWd',
                access_token_secret: '8GOGTDA8uY5T78GGMzlkQLaQE7nxuhyxyHMXEUZKDMHFe'
            });
            twitter.post('statuses/update', {status: 'I Love Twitter'},  function(error, tweet, response) {
                if(error) {
                    context.fail(error);
                }
                console.log(tweet);  // Tweet body. 
                console.log(response);  // Raw response object. 
                context.succeed(data.ContentType);
            });

            console.log('CONTENT TYPE:', data.ContentType);
            fs.writeFile("/tmp/test.png", data, function (err) { 
               if (err) { 
                   console.log("write failed");
                   context.fail("writeFile failed: " + err); 
               } else { 
                   console.log("write succeeded");
                   im.readMetadata("/tmp/test.png", function(err, metadata){
                      console.log("inside readMetadata");
                       if (err) {
                           context.fail("readMetadata failed: " + err); 
                       }
                       console.log('Shot at '+metadata.exif.dateTimeOriginal);
                       context.succeed(data.ContentType);
                   });
               }
            });
        }
    });
};
