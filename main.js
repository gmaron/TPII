var express = require("express");
var app = express();

//var user = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extend:true
}));

var path = require('path');
var appDir = path.dirname(require.main.filename);

var emailAdmin = "ppsgalileo@gmail.com";
var claveAdmin = "1234";

app.set('view options', { layout: false });
app.set('view engine', 'ejs');

var request = require("request");
var portMusic = "8000";
var ipMusic = "192.168.0.10";
var dirMusic = "http://"+ipMusic+":"+portMusic+"/";

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
    
    
    //res.render(appDir + '/inicio.ejs', {errorMessage: "", errorMessageRegister: "", successMessageRegister: ""});        
    
    
});

app.post("/registro", function (req, res){
      var regEmail = req.body.email;
      recoveryUserByEmail(regEmail,function (err,content){
          if(err){
              console.log (err);
          }else{
                if (content !== null){
                res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"Usuario ya registrado",successMessageRegister:""});        
            }else{
                recoveryAllUsers(function (err,content){
                    var passEncontrada = 0;
                    while (passEncontrada === 0){
                        var regPass = passwordRandom();
                        for(var i = 0; i < content.length; i++)
                        {
                          if(content[i].password !== regPass)
                          {
                            passEncontrada = 1;
                          }
                        }
                    }
                    var regNombre = req.body.nom;
                    var regApellido = req.body.ape;
                    var regEmail = req.body.email;
                    var regDNI = req.body.dni;
                    var regTemp = req.body.temp;
                    var regLuz = req.body.luz;
                    saveUserDataBase(regNombre,regApellido,regDNI,regEmail,regPass,regTemp,regLuz);
                    sendEmail(regEmail,regNombre,regPass);
                    res.render(appDir+'/inicio.ejs',{errorMessage:"",
                                                errorMessageRegister:"",
                                                successMessageRegister:"Verifique su casilla para obtener la contrasena"}); 
                });
            }
          }
      });  
    });

app.post("/log", function(req, res) { 
    recoveryUser(req.body.email,req.body.pass,function (err,content){
    if (err){
        console.log(err);
    }else{
        if (content !== null){            
            if (req.body.email !== emailAdmin){
                var dBemail = content[0].email;  
                var dBnombre = content[0].nombre;
                var dBapellido = content[0].apellido;
                var dBdni = content[0].dni;
                var dBtemp = content[0].temp;
                var dBluz = content[0].luz;
                var dBpass = content[0].password;
                res.render(appDir+"/perfilUsuario.ejs", {userName:dBnombre,
                                                         userSurname:dBapellido,
                                                         userDNI:dBdni,
                                                         userEmail:dBemail,
                                                         userTemp: dBtemp,
                                                         userLuz: dBluz,
                                                         userPass: dBpass,
                                                         errorMessageEmail:""});
            }else{
                var dBemail = content[0].email;  
                var dBnombre = content[0].nombre;
                var dBapellido = content[0].apellido;
                var dBdni = content[0].dni;
                var dBtemp = content[0].temp;
                var dBluz = content[0].luz;
                var dBpass = content[0].password;
                res.render(appDir+"/perfilAdministrador.ejs", {userName:dBnombre,
                                                         userSurname:dBapellido,
                                                         userDNI:dBdni,
                                                         userEmail:dBemail,
                                                         userTemp: dBtemp,
                                                         userLuz: dBluz,
                                                         userPass: dBpass,
                                                         errorMessageEmail:""});            
            }
        }else{
            res.render(appDir+'/inicio.ejs',{errorMessage:"Usuario/Contrasena invalida",
                                             errorMessageRegister:"", successMessageRegister:""});
        }
    }
}); });

app.post("/historico",function(req,res){
    recoveryAllUsers(function(err,content){
        if (err)
            console.log(err)
        else{
            var dataObject = [];
            for (var i=0; i < content.length; i++){
                dataObject.push({ nombre:content[i].nombre,apellido:content[i].apellido,dni:content[i].dni,email:content[i].email});
            }
            recoveryAllAuditoria(function(err,content){
                if (err)
                    console.log(err)
                else{
                    var dataObjectAud = [];
                    var dataObjectAudHistorico = [];
                    for (var i=0; i < content.length; i++){  
                        //Historicos
                        if(content[i].fechaSalida != null){
                dataObjectAudHistorico.push({email:content[i].email,fechaEntrada:content[i].fechaEntrada,fechaSalida:content[i].fechaSalida});  
                        }else{
                        dataObjectAud.push({email:content[i].email,fechaEntrada:content[i].fechaEntrada});
                        }
                    }                    
                    res.render(appDir + '/historicoAdministrador.ejs',{data:dataObject,dataAuditoriaHistorico:dataObjectAudHistorico,dataAuditoria:dataObjectAud});
                }
            });            
        }
    });            
});

app.post("/perfil",function(req,res){
    recoveryUser(emailAdmin,claveAdmin,function (err,content){
    if (err){
        console.log(err);
    }else{
        if (content !== null){                        
                var dBemail = content[0].email;  
                var dBnombre = content[0].nombre;
                var dBapellido = content[0].apellido;
                var dBdni = content[0].dni;
                var dBtemp = content[0].temp;
                var dBluz = content[0].luz;
                var dBpass = content[0].password;
                res.render(appDir+"/perfilAdministrador.ejs", {userName:dBnombre,
                                                         userSurname:dBapellido,
                                                         userDNI:dBdni,
                                                         userEmail:dBemail,
                                                         userTemp: dBtemp,
                                                         userLuz: dBluz,
                                                         userPass: dBpass,
                                                         errorMessageEmail:""});
            }else{
                console.log("Error de acceso en base de datos - app.post(\"/perfil\"....)");
            
            }
    }
    });  
});
 
app.post("/modPerfil",function (req,res){
      var regEmail = req.body.email;
      var regNombre = req.body.nom;
      var regApellido = req.body.ape;
      var regTemp = req.body.temp;
      var regLuz = req.body.luz;
      var regPass = req.body.pass; 
      var regDNI = req.body.userDNI;
      recoveryUserByPass(regPass,function (err,content){         
          if (err){
             console.log (err);            
          }else{
            var dBid = content[0].id; //Como recupero por clave, siempre hace referencia al usuario que esta modificando el perfil
            if (regPass === claveAdmin){
                if (regEmail === content[0].email){ //Quiere decir que el administrador no cambio el email
                    updateUserDataBase(regNombre,regApellido,regEmail,regTemp,regLuz,dBid);
                    res.render(appDir+"/perfilAdministrador.ejs", {userName:regNombre,
                                                         userSurname:regApellido,
                                                         userDNI:regDNI,
                                                         userEmail:regEmail,
                                                         userTemp: regTemp,
                                                         userLuz: regLuz,
                                                         userPass: regPass,
                                                         errorMessageEmail:""});
                }else{
                    recoveryUserByEmail(regEmail,function(err,contentEmail){
                        if (err){
                            console.log(err);
                        }else{
                            if (content === null){ // no hay nadie con ese email
                                updateUserDataBase(regNombre,regApellido,regEmail,regTemp,regLuz,dBid);
                                res.render(appDir+"/perfilAdministrador.ejs", {userName:regNombre,
                                                         userSurname:regApellido,
                                                         userDNI:regDNI,
                                                         userEmail:regEmail,
                                                         userTemp: regTemp,
                                                         userLuz: regLuz,
                                                         userPass: regPass,
                                                         errorMessageEmail:""});
                            }else{ //NO CAMBIO NINGUN CAMPO
                                var dBemail = content[0].email;  
                                var dBnombre = content[0].nombre;
                                var dBapellido = content[0].apellido;
                                var dBtemp = content[0].temp;
                                var dBluz = content[0].luz;
                                res.render(appDir+"/perfilAdministrador.ejs", {userName:dBnombre,
                                                                     userSurname:dBapellido,
                                                                     userDNI:regDNI,
                                                                     userEmail:dBemail,
                                                                     userTemp: dBtemp,
                                                                     userLuz: dBluz,
                                                                     userPass: regPass,
                                                                     errorMessageEmail:"El email ya se encuentra registrado"});
                            }                        
                        }                
                    });                                
                }                          
            }else{
                if (regEmail === content[0].email){ //Quiere decir que el usuario no cambio el email
                    updateUserDataBase(regNombre,regApellido,regEmail,regTemp,regLuz,dBid);
                    res.render(appDir+"/perfilUsuario.ejs", {userName:regNombre,
                                                         userSurname:regApellido,
                                                         userDNI:regDNI,
                                                         userEmail:regEmail,
                                                         userTemp: regTemp,
                                                         userLuz: regLuz,
                                                         userPass: regPass,
                                                         errorMessageEmail:""});
                }else{
                    recoveryUserByEmail(regEmail,function(err,contentEmail){
                        if (err){
                            console.log(err);
                        }else{
                            if (content === null){ // no hay nadie con ese email
                                updateUserDataBase(regNombre,regApellido,regEmail,regTemp,regLuz,dBid);
                                res.render(appDir+"/perfilUsuario.ejs", {userName:regNombre,
                                                         userSurname:regApellido,
                                                         userDNI:regDNI,
                                                         userEmail:regEmail,
                                                         userTemp: regTemp,
                                                         userLuz: regLuz,
                                                         userPass: regPass,
                                                         errorMessageEmail:""});
                            }else{ //NO CAMBIO NINGUN CAMPO
                                var dBemail = content[0].email;  
                                var dBnombre = content[0].nombre;
                                var dBapellido = content[0].apellido;
                                var dBtemp = content[0].temp;
                                var dBluz = content[0].luz;
                                res.render(appDir+"/perfilUsuario.ejs", {userName:dBnombre,
                                                                     userSurname:dBapellido,
                                                                     userDNI:regDNI,
                                                                     userEmail:dBemail,
                                                                     userTemp: dBtemp,
                                                                     userLuz: dBluz,
                                                                     userPass: regPass,
                                                                     errorMessageEmail:"El email ya se encuentra registrado"});
                            }                        
                        }                
                    });                                
                } 
            }
          }          
      });   
});

app.post("/cerrarSesion",function (req,res){
        res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"",successMessageRegister:""});
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



/*---------------------------Variables y funciones para la Base de Datos--------------*/


var ipDataBase = '192.168.0.102'; 	// ip de la base de datos
var usrDataBase = 'milton';         // nombre de usuario
var passDataBase = 'milton';        // contrasena
var nameDataBase = 'tp2';           // nombre de la base de datos


/*
*   function: saveUserDataBase()
*       ---> genera la conexion y guarda un usuario en la base de datos
*   Parametros       
*		--> nombre: nombre del usuario
*		--> apellido: apellido del usuario
*		--> dni: dni del usuario
*		--> email: email del usuario
*		--> pass: contrasena del usuario
*		--> temp: temperatura elegida por el usuario
*		--> luz: porcentaje de luz elegido por el usuario
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
        if (err)
            console.log(err);
    });

    connection.end();
}


function updateUserDataBase(nombre,apellido,email,temp,luz,id){
      var mysql      = require('mysql');
      var connection = mysql.createConnection({      
      host     : ipDataBase,
      user     : usrDataBase,      
      password : passDataBase,
      database : nameDataBase
        
    });
    connection.connect();

    var valuesUpdate = {nombre: nombre, apellido: apellido, email: email, temp:temp, luz:luz};
    var querySentence = 'UPDATE usuario SET ? WHERE id='+id+'';
    var query = connection.query(querySentence,valuesUpdate, function(err, result) {
        if (err){
            console.log(err);
        }
    });
    connection.end();
}


function recoveryAllUsers(callback){
    
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();

    var query = 'SELECT * FROM usuario u';
    
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

/*
*   function: recoveryUser()
*       ---> genera la conexion y consulta si un usuario y su contrasena se encuentran
*            en la base de datos     
*   Parametros:       
*       --> email: email del usuario
*       --> pass: contrasena
*   Retorno
*       --> fila con datos del usuario si existe
*       --> null si no existe
*
*/


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


/*
*   function: recoveryUserByEmail()
*       ---> genera la conexion y consulta si un usuario se encuentran
*            en la base de datos     
*   Parametros:       
*       --> email: email del usuario
*   Retorno
*       --> fila con datos del usuario si existe
*       --> null si no existe
*
*/


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

function recoveryUserByPass (pass,callback){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();

    var query = 'SELECT * FROM usuario u WHERE u.password="'+pass+'"';
    
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

function fechaHoyConHora(){
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1; //Enero es el mes 0
    var yy = hoy.getFullYear();
    var hh = hoy.getHours();
    var min = hoy.getMinutes();
        if (parseInt(min,10) < 10){
        min = '0'+min;
    }
    return hh+":"+min+" - "+dd+"/"+mm+"/"+yy;
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

    for( var i=0; i < 4; i++ )
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
        if (parseInt(min,10) < 10){
        min = '0'+min;
    }
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
        if (err)
            console.log(err);
    });

    connection.end();
    
}

function recoveryAllAuditoria (callback){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();

    var query = 'SELECT * FROM auditoria a';
    
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

function updateAuditoriaDataBase(email){
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1; //Enero es el mes 0
    var yy = hoy.getFullYear();
    var hh = hoy.getHours();
    var min = hoy.getMinutes();
    if (parseInt(min,10) < 10){
        min = '0'+min;
    }
    
    var fechaSalida = hh+":"+min+" - "+dd+"/"+mm+"/"+yy;
    
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : ipDataBase,
      user     : usrDataBase,
      password : passDataBase,
      database : nameDataBase
    });
    connection.connect();
    var valuesInsert = {fechaSalida: fechaSalida};
    var query = connection.query('UPDATE auditoria a SET ? WHERE (a.fechaSalida IS NULL)&&(a.email="'+email+'");', valuesInsert,       function(err, result) {
        if (err)
            console.log(err);
        
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
    serverEmail.send({
       text:    "Sr/a. "+nombre+" \n \nSu clave de acceso es: "+pass+"\n \nSaludos,\n \nGalileo", 
       from:    "Galileo <ppsgalileo@gmail.com>", 
       to:      nombre+" "+email,
       //cc:      "else <else@your-email.com>",
       subject: "Clave de acceso - Galileo"
    }, function(err, message) { if (err!=null) console.log(err); });
}

/*
*
*   getPassword()
*       --> obtiene la contrasena ingresada por el usuario
*   Parametros:
*       --> passConEnter: es la contrasena leida desde el archivo con el
*           formato -> 'contrasenaConNumero'Enter
*   Retorno:
*       --> pass: la contrsena ingresada por el usuario
*/
function getPassword(passConEnter){
    var pass = '';
    var i = 0;
    var passSplit = passConEnter.split('');    
    //por si el usuario solo apreto Enter o por las dudas
    if (passSplit.length > 0){
        //la E es de Enter
        while (passSplit[i] !== 'E'){
            if(parseInt(passSplit[i],10) >= 0 ){
                pass += passSplit[i];
            }
            i++;
        }
    }
    return pass;
}


/*
*
*   Ejecucion del programa que lee los eventos del teclado
*   Codigo fuente: teclado.c
*   Ejecutable: teclado
*   ----> Fijarse el parametro en el linux de la placa antes de correr el programa
*/
var exec = require('child_process').exec;
var child;
var evento = "/dev/input/event2";
var gcc = "gcc -o teclado teclado.c";
var perm = "chmod 777 teclado";
var ejecutarTeclas = "cd "+appDir+"; "+gcc+";"+perm+";  ./teclado "+evento;
child = exec(ejecutarTeclas, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});



var mraa = require("mraa");
var B = 3975;
//GROVE Kit A0 Connector --> Aio(0)
function tempActual (){

    var myAnalogPin = new mraa.Aio(0);
    var a = myAnalogPin.read();
     var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    //console.log("Resistance: "+resistance);
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
    
    var int_celsius = Math.floor( celsius_temperature );

    return int_celsius;
        
   /* var text = "";
    var possible = "0123456789";
    var tempEncontrada = 0;
    while (tempEncontrada === 0){ 
        for( var i=0; i < 2; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        if ((parseInt(text,10) < 30)&&(parseInt(text,10) > 18))
            tempEncontrada = 1;
        else
            text = "";
    }
    return text;*/
}

var lcd = require("jsupm_i2clcd");
var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
var sleep = require("sleep");
var puedoEscribir = 1;

function mensajeLCDconDelay (msj,msj2){
    puedoEscribir = 0;
    writeLCD(msj,0,0);
    writeLCD(msj2,1,0);
    sleep.sleep(2);
    puedoEscribir = 1;
}

function writeLCD (dato,fil,col){
    display.setCursor(fil,col);
    display.write(dato);
    
}

function cleanLCD(){
    writeLCD("                ",0,0);
    writeLCD("                ",1,0);
}


/*
*   Programa principal
*       --> cada 1 segundo
*       --> Lee el archivo teclas.txt
*       --> Corrobora que el usuario haya apretado el Enter
*           --> si lo apreto quiere decir que hay una nueva contrasena
*           --> se fija si la contrasena pertenece a un usuario 
*               --> si pertenece, reconoce al usuario
*               --> sino, informa que el usuario no existe
*/

fs = require('fs');
var hayUnoAdentro = 0;
var intervalSensores;

var pwm = new mraa.Pwm(3);
pwm.write(0.0);
pwm.enable(false);

var msj_lcd = "Libre";



setInterval(function(){
  fs.readFile(appDir+'/teclas.txt', 'utf8', function (err,data) {   
  if (err) {
    return console.log(err);
  }else{
    
    var data_sin_espacio = data.replace(" ","");
    if (data_sin_espacio.search("Enter") > 0){
            
            
            var pass = getPassword(data_sin_espacio);
            fs.writeFile(appDir+'/teclas.txt','', function (err,data) {
                if(err)
                    console.log(err);
            });
            
            
            recoveryUserByPass(pass,function(err,content){
                if (err)
                    console.log(err);
                else{
                    if (content !== null){                    
                        var dBusr = content[0].email;
                        var registrado = 0;
                        var dBtemp = content[0].temp;
                        var dBluz = content[0].luz;
                        var dbApellido = content[0].apellido;
                        recoveryAllAuditoria(function(err,content){
                            for (var i = 0; i < content.length ; i++){
                                if ((content[i].fechaSalida === null)&&(content[i].email === dBusr)){
                                    updateAuditoriaDataBase(content[i].email);
                                    registrado = 1;
                                    break;
                                }
                            }
                            if (registrado === 0){
                                if (hayUnoAdentro === 0){
                                    saveAuditoriaDataBase(dBusr);
                                    hayUnoAdentro = 1;                              
                                    cleanLCD();
                                    //writeLCD("Bienvenido",0,0);
                                    //writeLCD(dbApellido,1,0);
                                    mensajeLCDconDelay("Bienvenido",dbApellido);
                                    simuladorSensores(pass);
                                }else{
                                    cleanLCD();
                                    //writeLCD("---Habitacion---",0,0);
                                    //writeLCD("----Ocupada---->",1,0);
                                    mensajeLCDconDelay("---Habitacion---","----Ocupada---->");
                                }
                            }
                            else{
                                hayUnoAdentro = 0;
                                clearInterval(intervalSensores);
                                pwm.write(0.0);
                                pwm.enable(false);
                                cleanLCD();
                                //writeLCD("Hasta Prontos",0,0);
                                //writeLCD(fechaHoyConHora(),1,0);
                                mensajeLCDconDelay("Hasta Prontos",fechaHoyConHora());
                            }                                                
                        });                    
                    }else{
                        cleanLCD();
                        //writeLCD("Error Password",0,0);
                        //writeLCD("Intente de nuevo",1,0);
                        mensajeLCDconDelay("Error Password","Intente de nuevo");
                    }
                }
            });
      }else{
        if (puedoEscribir == 1){
            cleanLCD();
            if (hayUnoAdentro == 1){
                writeLCD("Ocupado",0,0);
            }else{
                writeLCD("Libre",0,0);
            }
            writeLCD("Pass: "+data_sin_espacio,1,0);
            }
        
        }  
  }
})},200);



function  simuladorSensores(pass){
   
    var dbLuz, dbTemp;
    pwm.enable(true);
    pwm.period_us(2000);
    var tempActInt = tempActual();  
    var tempInt;
    
    
    console.log("Temperatura sensada al momento del ingreso (int): "+tempActInt);

    intervalSensores = setInterval(function(){
    
         
        recoveryUserByPass(pass, function(err,content){
            if (err)
                console.log(err);
            else{
                if (content !== null){  
                    dbLuz = content[0].luz;
                    dbTemp = content[0].temp;
                }
                else{
                    //default
                    console.log("Error: Tomo valores por defecto");
                    dbLuz = 50;
                    dbTemp = 24;
                }
            }
            //Acondicionamiento de la luz
            var luz_led = (dbLuz / 100);
            if (luz_led <= 1.0){
                pwm.write(luz_led);
            }
            else{
                //default
                pwm.write(0.5);
            }
           
            //Acondicionamiento de la temperatura
            tempInt = parseInt(dbTemp,10);
            
            //Tomar una nueva temperatura actual y ver como va variando con el acondicionamiento
            if (tempInt < tempActInt){
                console.log("-->Bajar temperatura "+tempActInt);
                tempActInt--;
            }else{
                if (tempInt > tempActInt){
                    console.log("-->Subir temperatura "+tempActInt);
                    tempActInt++;
                }else{
                    console.log("-->Mantener temperatura "+tempActInt);
                }            
            }    
            
            
        });
    
        
        
    },1000);
}

