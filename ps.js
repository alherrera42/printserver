/*
Print server
Servicio de impresión por medio de petición HTTP
Alberto Herrera Olvera <alherrera42@gmail.com
*/
var port = 3000;
var printer = 'POS-58';
var printerPort = 'LPT1';
var express = require('express');
var app = express();
var exec = require('child_process').exec;
var fs = require('fs');
var tmp = require('tmp');
var isWin = /^win/.test(process.platform);

if(isWin) {
    console.log("Detectado exitosamente sistema operativo Windows");
    console.log("Asegúrate de compartir en red la impresora para que funcione. Actualmente está configurada como "+printer+" para trabajar por el puerto virtual "+printerPort+".");
    console.log("Si texiste un problema de mala impresión prueba Propiedades de impresora -> Avanzado ->Procesador de impresión, y cámbialo a 'texto'. ");
    console.log('Empezando la configuración...');
    exec('NET USE '+printerPort+' \\\\LOCALHOST\\'+printer+' /PERSISTENT:YES');
}
else {
    console.error('Aún no ha sido preparado este módulo para Linux/OSX. ');
}

app.get('/', function(req, res) {
    var text = decodeURI(req.query.text).replace('--','\n');
    var spaces = 2;
    if(typeof req.query.spaces != 'undefined') {
        spaces = parseInt(req.query.spaces);
    }
    for(let i=0; i<spaces; i++)
        text += '\n';
    console.log("Pretendes imprimir "+text);
    tmp.file(function(error,path,fd,cleanup){
        console.log("Seleccionado path: "+path);
        if(error)
            res.json({error:'No se pudo crear el archivo',original:error});
        else {
            fs.writeFileSync(path,text);
            exec('print /d:'+printerPort+' '+path);
            exec('delete '+path);
            console.log("Archivo impreso");
            res.json(req.query.text);
        }
    });
});

app.listen(port, function() {
    console.log('Servidor de impresión escuchando en el puerto '+port+'!');
});
