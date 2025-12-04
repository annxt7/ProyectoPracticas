const dbconection = require("../config/dbconect");

exports.getUsers= async (req, res) => {
  dbconection.connect((err) => {
    if (err) throw err;
    dbconection.query("SELECT * FROM `Users`", (err, rows, fields) => {
      if (err) throw err;
      console.log(rows);
      res.send(rows)
    });
  });
}