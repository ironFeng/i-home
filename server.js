var express = require('express');
var app = express();
var fs = require("fs");
var config_file = require("./config.js");
var im = require('imagemagick');
var ExifImage = require('exif').ExifImage;


var bodyParser = require('body-parser');
var multer  = require('multer');
 
app.use(express.static('public'));
app.use(bodyParser({
          keepExtensions:true,
          limit:10000000,
          defer:true           }));
app.use(multer({ dest: config_file.TEMPFILESAVEPLACE}).array('image'));
 
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

app.post('/getfiles', function (req, res) {
    if (req.body.data) {
        //能正确解析 json 格式的post参数
        res.send({"status": "success", "name": req.body.data.name, "age": req.body.data.age});
    } else {
        //不能正确解析json 格式的post参数
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            jsonStr ? res.send({"status":"success", "name": jsonStr.data.name, "age": jsonStr.data.age}) : res.send({"status":"error"});
        });
    }
});


app.post('/file_upload', function (req, res) {
 
   console.log(req.files[0]);  // 上传的文件信息
   var path_str = config_file.FILESAVEPLACE  + "/" + "gang";

   fs.exists(path_str,function(exists){
        if(!exists){
            fs.mkdir(path_str,function(err){
                if(err){
                    console.log('创建文件夹出错！');
                }else{
                    console.log(path_str+'文件夹-创建成功！');
                }
            });
        }else{
            console.log(path_str+'文件夹-已存在！');
        }
    });

   var des_file = __dirname +  "/" + path_str + "/" + req.files[0].originalname;
   console.log("dest_file" + des_file);
   console.log("receive file " +  req.files[0].originalname);
   console.log("receive file path " + req.files[0].path);
   fs.readFile( req.files[0].path, function (err, data) {
        console.log("dest_file " + des_file);
        fs.writeFile(des_file, data, function (err) {
         if( err ){
              console.log( err );
         }else{
           
              im.identify("upload/gang/20170514_175326.jpg", function(err, features){
                 if (err) throw err
                  console.log(features);
                  // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
              });
       
    /*
    new ExifImage({ image : des_file }, function (error, exifData) {
        if (error)
            console.log('Error: '+error.message);
        else
            console.log(exifData); // Do something with your data!
    });
    */
              
              im.readMetadata(des_file, function(im_err, metadata){
                 if (!im_err){
                     console.log('Shot at '+ metadata.exif.xResolution);
                 }
              });
             
               response = {
                   message:'File uploaded successfully', 
                   filename:req.files[0].originalname
              };
          }
          //console.log( response );
          //res.end( JSON.stringify( response ) );
          res.sendFile( __dirname + "/" + "index.htm" );
       });
   });
})
 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})