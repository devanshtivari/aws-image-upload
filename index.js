const AWS = require("aws-sdk");
const QRcode = require("qrcode");
const Jimp = require("jimp");
const S3_BUCKET = "name of the bucket to be created";
const s3bucket = new AWS.S3({ params: { Bucket: S3_BUCKET } });
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const userUuid = event.uuid;
  const generatedQR = await QRcode.toDataURL(userUuid, {
    errorCorrectionLevel: "H",
  });
  var filename = base64toImage(generatedQR, userUuid);
  let response;
  const fileExists = await s3
    .headObject({
      Bucket: S3_BUCKET,
      Key: filename,
    })
    .promise()
    .then(
      () => true,
      (err) => {
        if (err.code == "NotFound") {
          return false;
        }
        throw err;
      }
    );
  if (fileExists) {
    response = filename.toString();
  } else {
    const params = {
      Bucket: S3_BUCKET,
      Key: filename,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: "image/png",
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        response = "Error in uploading";
      } else {
        response = filename.toString();
      }
    });
  }
  return response;
};

const base64toImage = (QR, userUuid) => {
  const data = QR;
  const buffer = Buffer.from(data, "base64");
  var filename = userUuid + ".png";
  Jimp.read(buffer, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.write(filename);
  });
  return filename;
};
