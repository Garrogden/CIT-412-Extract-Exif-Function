const path = require('path');
const fs = requiere('fs-extra');
const os = require('os');
const {storage} = require("@google-cloud/storage");
const ExifImage = require("exif").ExifImage;
const parsdms = require('parse-dms');

exports.extractExIF = async (data, context) => {
    const photo = data;
    const storage = new Storage();
    const imageBucket = storage.bucket(photo.bucket);

    //Create a Working Directory
    const workingDir = path.join(os.tmpdir(), 'exif');
    const tempFilePath = path.join(workingDir, photo.name);
    
    //Wait for temp directory
    await fs.ensureDir(workingDir);
    
    //Download file to temp directory
    await imageBucket.file(photo.name).download({
        destination: tempFilePath
    });

    try{
        //Call Exif Helper Function 
        getExif(tempFilePath);


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
    console.log(data);
}