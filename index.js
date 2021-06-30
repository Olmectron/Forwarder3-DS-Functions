const functions = require('firebase-functions');
const fs = require('fs');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const cors = require('cors')({
	origin: true,
  });

  const shell = require('shelljs')

  function getByteArray(filePath){
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i+=2)
      result.push('0x'+fileData[i]+''+fileData[i+1])
    return result;
}

exports.requestPlatform = functions.https.onRequest((req,res) => {

	return cors(req,res,() => {
        var platform=null;
        try{
          platform=process.platform;
          return res.status(200).send({success:true,message:"Platform is: "+platform});

        }
        catch(err){
          return res.status(400).send({success:false,error:err,message:"Platform is not valid"});

        }
    });

});


exports.execMakeCia = functions.https.onRequest((req,res) => {
  if(req.body)
  console.log("BODYd",req.body);
  var data=JSON.parse(req.body);
  
	return cors(req,res,() => {
        
    try{
      var fileName=data.fileName.substring(0,data.fileName.length-4).replace(".nds","");
    
      fs.writeFile('/tmp/'+data.fileName, Buffer.from(data.fileArray), 'binary',  (err)=> {
        if (err) {
            console.log("There was an error writing the image")
            return res.status(400).send({success:false,code:code,stdout:stdout,stderr:stderr,data:array,error:err});
        }
        else {
            console.log("Written File :" + '/tmp/'+data.fileName)
       


                
                shell.exec('./make_cia --srl="/tmp/'+data.fileName+'" -o "/tmp/'+fileName+'.cia"', function(code, stdout, stderr) {
                  console.log('Exit code:', code);
                  console.log('Program output:', stdout);
                  console.log('Program stderr:', stderr);
                  var array=getByteArray('/tmp/'+fileName+'.cia');
                  if(code==0){

                    return res.status(200).send({success:true,code:code,stdout:stdout,stderr:stderr,data:array,fileName:(fileName+".cia")});
                  }
                  else{

                    return res.status(400).send({success:false,code:code,stdout:stdout,stderr:stderr});
                  }

                });

         }
});


    
  }
  catch(err){
    return res.status(400).send({success:false,error:err,message:"Couldn't execute make_cia"});

  }


    });

});

