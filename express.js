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

app.get("/", function (req, res) {
    res.render(appDir + '/inicio.ejs', {errorMessage: "", errorMessageRegister: "", successMessageRegister: ""});        
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
      console.log (regPass);    
      recoveryUserByPass(regPass,function (err,content){
          /*if(err){
              console.log (err);
          }else{
                var dBid = content[0].id;
                var dBDNI = content[0].dni;
                var dBpass = content[0].password;                
                //si el mail no esta en la base de datos o el mail es el mismo que ya tenia
                if ((content === null)||(content[0].email === regEmail)){
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
          }*/          
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


var ipDataBase = '192.168.0.13'; 	// ip de la base de datos
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
var evento = "/dev/input/event4";
var ejecutarTeclas = "cd "+appDir+"; ./teclado "+evento;
child = exec(ejecutarTeclas, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});

function tempActual (){
    var text = "";
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
    return text;
}


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
var hayUnoAdentro = 0;
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
                    var dBusr = content[0].email;
                    var registrado = 0;
                    var dBtemp = content[0].temp;
                    var dBluz = content[0].luz;
                    console.log("Usuario: "+content[0].email);
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
                                console.log("DISFRUTE SU ESTADIA");  
                                console.log("Ambiente a acondicionar -> Temperatura: "+dBtemp+" Luz:"+dBluz);
                                simuladorSensores(dBtemp,dBluz);
                            }else{
                                console.log("Habitacion ocupada");
                            }
                        }
                        else{
                            hayUnoAdentro = 0;
                            clearInterval(intervalSensores);
                            console.log("MUCHAS GRACIAS. VUELVA PRONTOS");
                        }                                                
                    });                    
                }else{
                    console.log("Usuario no encontrado");
                }
            }
        });
      }
  }
})},1000);


var intervalSensores;
function  simuladorSensores(temp,luz){
    console.log("Enciendo luz hasta "+luz+" % ");        
    var tempAct = tempActual();  
    
    var tempActInt = parseInt(tempAct,10);
    var tempInt = parseInt(temp,10);
    
    console.log("Temperatura sensada al momento del ingreso (int): "+tempActInt);
    console.log("Temperatura pedida (int): "+tempInt);

    
    
    intervalSensores = setInterval(function(){
    
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
    },1000);
}

