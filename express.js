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
var appDirImg = appDir + "/img";




app.set('view options', { layout: false });
app.set('view engine', 'ejs');

/* serves main page */
app.get("/", function (req, res) {
    res.render(appDir + '/inicio.ejs', {errorMessage: "", errorMessageRegister: "", successMessageRegister: ""});
});

app.post("/registro", function (req, res){
      var regEmail = req.body.email;
      recoveryUserByEmail(regEmail,function (err,content){
          if(err){
              console.log (err);
          }else{
            console.log(content);
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
    // some server side logic 
    recoveryUser(req.body.email,req.body.pass,function (err,content){
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
            res.render(appDir+"/perfilUsuario.ejs", {userName:dBnombre,
                                                     userSurname:dBapellido,
                                                     userDNI:dBdni,
                                                     userEmail:dBemail,
                                                     userTemp: dBtemp,
                                                     userLuz: dBluz,
                                                     userPass: dBpass,
                                                     errorMessageEmail:""});
        }else{
            res.render(appDir+'/inicio.ejs',{errorMessage:"Usuario/Contrasena invalida",
                                             errorMessageRegister:"",
                                             successMessageRegister:""});
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
      recoveryUserByEmail(regEmail,function (err,content){
          if(err){
              console.log (err);
          }else{
                var dBid = content[0].id;
                var dBDNI = content[0].dni;
                var dBpass = content[0].password;                
                //si el mail no esta en la base de datos o el mail es el mismo que ya tenia
                if ((content === null)||(content[0].email === regEmail)){
                    console.log('modifico perfil');
                    updateUserDataBase(regNombre,regApellido,regEmail,regTemp,regLuz,dBid);
                    res.render(appDir+"/perfilUsuario.ejs", {userName:regNombre,
                                                         userSurname:regApellido,
                                                         userDNI:dBDNI,
                                                         userEmail:regEmail,
                                                         userTemp: regTemp,
                                                         userLuz: regLuz,
                                                         userPass: dBpass,
                                                         errorMessageEmail:""});
                }else{
                    var dBemail = content[0].email;  
                    var dBnombre = content[0].nombre;
                    var dBapellido = content[0].apellido;
                    var dBdni = content[0].dni;
                    var dBtemp = content[0].temp;
                    var dBluz = content[0].luz;
                    res.render(appDir+"/perfilUsuario.ejs", {userName:dBnombre,
                                                         userSurname:dBapellido,
                                                         userDNI:dBdni,
                                                         userEmail:dBemail,
                                                         userTemp: dBtemp,
                                                         userLuz: dBluz,
                                                         userPass: dBpass,
                                                         errorMessageEmail:"El email ya se encuentra registrado"});                      
                }  
          }
      });   
});

app.post("/cerrarSesion",function (req,res){
        res.render(appDir+'/inicio.ejs',{errorMessage:"",errorMessageRegister:"",successMessageRegister:""});
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


var ipDataBase = '192.168.188.128'; // ip de la base de datos
//var ipDataBase = '192.168.0.13'; // ip de la base de datos
//var usrDataBase = 'milton';           // nombre de usuario
var usrDataBase = 'root';           // nombre de usuario
var passDataBase = 'milton';        // contrasena
var nameDataBase = 'tp2';           // nombre de la base de datos


/*
*   function: saveUserDataBase()
*       ---> genera la conexion y guarda un usuario en la base de datos
*   Parametros       
*
*
*/
function saveUserDataBase(nombre,apellido,dni,pass,email,temp,luz){
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
                console.log('pass: '+pass);
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
var evento = "/dev/input/event1";
var ejecutarTeclas = "cd "+appDir+"; ./teclado "+evento;

child = exec(ejecutarTeclas, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});



/*
*
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
setInterval(function(){
  fs.readFile(appDir+'/teclas.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }else{
    if (data.search("Enter") > 0){
        var pass = getPassword(data);
        console.log('password: '+pass);
        fs.writeFile(appDir+'/teclas.txt', '', function (err,data) {
            if(err)
                console.log(err);
        });
        recoveryUserByPass(pass,function(err,content){
            if (err)
                console.log(err);
            else{
                if (content !== null){
                    console.log("Usuario: "+content[0].email);
                }else{
                    console.log("Usuario no encontrado");
                }
            }
        });
      }
  }
})},1000);


