require("dotenv").config();
const mysql= require('mysql2');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : process.env.DB_USER,
  password : process.env.DB_PSS,
  database : process.env.DB_NAME
});

connection.connect(err=>{
    if(err){
        console.log('Error al conectar a la base de datos'+err)
    }else{
        console.log('Conectado a la base de datos')
    }
})
module.exports = connection;