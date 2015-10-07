 var express = require("express");
 var app = express();
 var user = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extend:true
}));



var path = require('path');
var appDir = path.dirname(require.main.filename);
var appDirImg = appDir+"/img";




 app.set('view options', { layout: false });
 app.set('view engine', 'ejs');

/* serves main page */
 app.get("/", function(req, res) {
    res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"",successMessageRegister:""});
 });
 

    app.post("/registro",function(req,res){
      console.log("Entre al post del registro");
      var regEmail = req.body.email;
      recoveryUserByEmail(regEmail,function (err,content){
          console.log("Voy a busca usuarios");
          if(err){
              console.log (err);
          }else{
            console.log(content);
            if (content !== null){
                console.log("Usuario ya registrado");
                res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"Usuario ya registrado",successMessageRegister:""});        
            }else{
                console.log("arriba del guardar");
                var regNombre = req.body.nombre;
                var regApellido = req.body.apellido;
                var regEmail = req.body.email;
                var regDNI = req.body.dni;
                var regPass = passwordRandom();
                var regTemp = req.body.temp;
                var regLuz = req.body.luz;
            
                console.log("arriba del guardar");
                saveUserDataBase(regNombre,regApellido,regDNI,regEmail,regPass,regTemp,regLuz);
                console.log("arriba del guardar email");
                sendEmail(regEmail,regNombre,regPass);
res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"",successMessageRegister:"Verifique su casilla para obtener la contrasena"}); 
            }
          }
      });  
    });


  app.post("/log", function(req, res) { 
    // some server side logic 
    console.log("Entre por el post");
    
    recoveryUser(req.body.email,req.body.pass,function (err,content){
    if (err){
        console.log(err);
    }else{
        console.log("Contenido: "+content);
        if (content !== null){
            var dBemail = content[0].email;  
            var dBnombre = content[0].nombre;
            var dBapellido = content[0].apellido;
            var dBdni = content[0].dni;
            var dBFecha = fechaHoy();

            res.render(appDir+"/perfilUsuario.ejs", {userName:dBnombre,userSurname:dBapellido,userDNI:dBdni,
                                             userEmail:dBemail });
        }else{
            res.render(appDir+'/inicio.ejs',{errorMessage:"Usuario/Contrasena invalida",
                                             errorMessageRegister:"",
                                             successMessageRegister:""});
        }
    }
  });
    //res.render(appDir+'/perfilUsuario.ejs',{title:"homepage"});
    
  });
 
 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( __dirname + req.params[0]); 
 });
 
 var port = process.env.PORT || 5000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });





/*---------------------------Variables y funciones para la Base de Datos--------------*/

<<<<<<< Updated upstream
//var ipDataBase = '192.168.188.128'; // ip de la base de datos
=======
>>>>>>> Stashed changes
var ipDataBase = '192.168.0.13'; // ip de la base de datos
var usrDataBase = 'milton';           // nombre de usuario
var passDataBase = 'milton';        // contrasena
var nameDataBase = 'tp2';           // nombre de la base de datos


/*
*   function: saveUserDataBase()
*       ---> genera la conexion y guarda un usuario en la base de datos
*   Parametros       
*
*
*/
function saveUserDataBase(nombre,apellido,dni,email,pass,temp,luz){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({      
      host     : ipDataBase,
      user     : usrDataBase,      
      password : passDataBase,
      database : nameDataBase
        
    });
    connection.connect();
    
    var valuesInsert = {nombre: nombre, apellido: apellido, dni: dni, email: email, password: pass, temp:temp, luz:luz};
    var query = connection.query('INSERT INTO usuario SET ?', valuesInsert, function(err, result) {
        // Neat!
    });

    connection.end();


}

/*
*   function: recoveryUser()
*       ---> genera la conexion y consulta si un usuario y su contrasena se encuentran
*            en la base de datos     
*   Parametros:       
*       --> email: email del usuario
*       --> pass: contrasena
*   Retorno
*       --> 1 si existe
*       --> 0 si no existe
*
*/
var pathname;


function recoveryUser(email,pass,callback){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();

    var query = 'SELECT * FROM usuario u WHERE (u.email="'+email+'" and u.password="'+pass+'")';
    
    var resQuery = connection.query(query,function(err, rows, fields) {
          if (!err){
              if (rows.length > 0)
                return callback(null, rows);
              else
                return callback (null,null)
          }else{
              return callback (err,null);
          }
        connection.end();
    });

    
    
}

function recoveryUserByEmail (email,callback){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();

    var query = 'SELECT * FROM usuario u WHERE u.email="'+email+'"';
    
    var resQuery = connection.query(query,function(err, rows, fields) {
          if (!err){
              if (rows.length > 0)
                return callback(null, rows);
              else
                return callback (null,null)
          }else{
              return callback (err,null);
          }
        connection.end();
    });
}

function fechaHoy(){
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1; //Enero es el mes 0
    var yy = hoy.getFullYear();
    
    return dd+"/"+mm+"/"+yy;

}

/*
*
*   function: passwordRandom()
*       ---> genera una contrasena de ocho (8) numeros aleatorios
*
*/

function passwordRandom()
{
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



/*
*
*
*
*
*/


function saveAuditoriaDataBase (email){
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1; //Enero es el mes 0
    var yy = hoy.getFullYear();
    var hh = hoy.getHours();
    var min = hoy.getMinutes();
    
    var fechaEntrada = hh+":"+min+" - "+dd+"/"+mm+"/"+yy;
    
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();
    
    
    var valuesInsert = {fechaEntrada: fechaEntrada, email: email};
    var query = connection.query('INSERT INTO auditoria SET ?', valuesInsert, function(err, result) {
        // Neat!
    });

    connection.end();
    
}

/*---------------------------Variables y funciones para manipular Emails--------------*/

var email   = require("emailjs");
var serverEmail  = email.server.connect({
   user:    "ppsgalileo@gmail.com", 
   password:"ingenieriaencomputacion", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

/*
*   function: sendEmail ()
*       ---> envia un mail con texto plano al usuario con su respectiva contrasena
*   Parametros:
*       ---> email: direccion para enviar el mail. Formato: direccion@servidor.com
*       ---> nombre: nombre del destinario
*       ---> pass: contrasena para el destinatario
*/
function sendEmail(email,nombre,pass){
    
    // send the message and get a callback with an error or details of the message that was sent
    serverEmail.send({
       text:    "Sr/a. "+nombre+" \n \nSu clave de acceso es: "+pass+"\n \nSaludos,\n \nGalileo", 
       from:    "Galileo <ppsgalileo@gmail.com>", 
       to:      nombre+" "+email,
       //cc:      "else <else@your-email.com>",
       subject: "Clave de acceso - Galileo"
    }, function(err, message) { if (err!=null) console.log(err); });

}

