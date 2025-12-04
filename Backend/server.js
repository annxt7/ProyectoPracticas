const express = require("express");
const app = express();
const port = 3000;
const userRoutes= require('./routes/userRoutes')
const dbconection = require("./config/dbconect");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
async function fetchData() {
  try {
    const [rows, fields] = await dbconection.execute("SELECT * FROM `Users`");

    console.log("Resultados de Users:", rows);
  } catch (error) {
    console.error("ERROR al ejecutar SELECT * FROM Users:", error);
  }
}

app.use('/api/users',userRoutes)
app.get("/test-db", (req, res) => {
  dbconection.query("SELECT 1 + 1 AS solution", (err, rows) => {
    if (err) {
      console.log("Error en la consulta: ", err);
      res.status(500).send("Error al consultar la base de datos");
    } else {
      console.log("La solución es:", rows[0].solution);
      res.send("TODO OK");
    }
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
