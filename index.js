const path = require('path');
const fs = require('fs-extra')
const os = require('os');
const {Storage} = require("@google-cloud/storage");
const ExifImage = require("exif").ExifImage;
const parseDMS = require('parse-dms');

exports.extractEXIF = async (data, context) => {
    const photo = data;
    const storage = new Storage();
    const imageBucket = storage.bucket(photo.bucket);

    //Create a Working Directory
    const workingDir = path.join(os.tmpdir(), 'exif');
    const tmpFilePath = path.join(workingDir, photo.name);
    
    //Wait for temp directory
    await fs.ensureDir(workingDir);
    
    //Download file to temp directory
    await imageBucket.file(photo.name).download({
        destination: tmpFilePath
    });

    try{
        //Call Exif Helper Function 
        getExif(tmpFilePath);


    } catch(error){
        console.log('Error:' + error.message)

    }
    //Clean Up
    await fs.remove(workingDir);
    return true;
};


//Helper Functions
function getExif (tempImage){
    new ExifImage(
        {image : tempImage},
        function (error, exifData){
            if (error)
            console.log('Error: ' + error.message)
            else
            logExif (exifData);
        }
    )
}

function logExif (data) {
    console.log(data.exif.CreateDate);
    console.log(data);    
    dms_String(data.gps.GPSLatitude[0], data.gps.GPSLatitude[1], data.gps.GPSLatitude[2]);
    dms_String(data.gps.GPSLongitude[0],data.gps.GPSLongitude[1], data.gps.GPSLongitude[2]);

}

function dms_String (deg, min, sec) {
    console.log("Degrees: " + deg + " Minutes: " + min + " Seconds: " + sec);
    console.log(deg + min /60 + sec /3600);
}