var express = require("express");
var app = express();

var request = require("request");
var portMusic = "8000";
var ipMusic = "192.168.0.10";
var dirMusic = "http://"+ipMusic+":"+portMusic+"/";


/*request(dirMusic+"musicOn?num=6", function(error, response, body) {
    console.log("body: -"+body+"-");
    console.log("response: -"+response+"-");
});




request(dirMusic+"changePlaylist?num=5", function(error, response, body) {
});



request(dirMusic+"musicOff", function(error, response, body) {
});
*/





var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
var appDir = path.dirname(require.main.filename);

var emailAdmin = "ppsgalileo@gmail.com";
var claveAdmin = "1234";

app.set('view options', { layout: false });
app.set('view engine', 'ejs');

var cancionesPlayList0 = "";
var cancionesPlayList1 = "";
var cancionesPlayList2 = "";

var nombrePlaylist0 = "";
var nombrePlaylist1 = "";
var nombrePlaylist2 = "";


var Sequence =  require('sequence').Sequence;
var sequence = Sequence.create();

app.get("/", function (req, res) {
    
    var dbNumPlay0 = "9";
    var dbNumPlay1 = "3";
    var dbNumPlay2 = "10";
    
    sequence.then(function(next){
        setTimeout(function(){
            request(dirMusic+"damePlaylist?num="+dbNumPlay0, function(error, response, body) {
                cancionesPlayList0 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
           request(dirMusic+"dameNombrePlaylist?num="+dbNumPlay0, function(error, response, body) {
                nombrePlaylist0 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
            request(dirMusic+"damePlaylist?num="+dbNumPlay1, function(error, response, body) {
                cancionesPlayList1 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
           request(dirMusic+"dameNombrePlaylist?num="+dbNumPlay1, function(error, response, body) {
                nombrePlaylist1 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
            request(dirMusic+"damePlaylist?num="+dbNumPlay2, function(error, response, body) {
                cancionesPlayList2 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
           request(dirMusic+"dameNombrePlaylist?num="+dbNumPlay2, function(error, response, body) {
                nombrePlaylist2 = body;
            });    
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
            res.render(appDir + '/inicio.ejs', {errorMessage: "", 
                                                errorMessageRegister: "",
                                                successMessageRegister:"",
                                                namePlaylist0:nombrePlaylist0,
                                                cancionesPlaylist0:cancionesPlayList0,
                                                indexPlaylist0:dbNumPlay0,
                                                namePlaylist1:nombrePlaylist1,
                                                cancionesPlaylist1:cancionesPlayList1,
                                                indexPlaylist1:dbNumPlay1,
                                                namePlaylist2:nombrePlaylist2,
                                                cancionesPlaylist2:cancionesPlayList2,
                                                indexPlaylist2:dbNumPlay2
                                               });    
        next();
        },100);
        
    });
    
    
    
    /*request(dirMusic+"damePlaylist?num=12", function(error, response, body) {
        recBodyCanciones(body);
        //cancionesPlayList += response.body;   
        //console.log("response.body: "+response.body);

    });
    request(dirMusic+"dameNombrePlaylist?num=12", function(error, response, body) {
        nombrePlaylist = body;
    });
    console.log("playlist: -"+nombrePlaylist+"-");
    console.log("canciones: "+cancionesPlayList);
    res.render(appDir + '/inicio.ejs', {errorMessage: "", errorMessageRegister: "", successMessageRegister: "",namePlaylist:nombrePlaylist,cancionesPlaylist:cancionesPlayList});        
    */
});




 // serves all the static files 
app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( appDir + req.params[0]); 
 });
 


var port = process.env.PORT || 5000;
app.listen(port, function() {
   console.log("Listening on " + port);
});















