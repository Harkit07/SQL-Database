const express = require("express");
const app = express();
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const uuid = require("uuid");
const path = require("path");
const methodOverride = require('method-override');

const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));

let createRamdomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Sran@0001",
});

app.listen(port, () => {
  console.log(`listening on the port ${port}`);
});

//Root Route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      let count = users[0]["count(*)"];
      res.render("home.ejs", {count});
    })
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

//Route to see all users
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      res.render("users.ejs", {users});
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

//Route to edit users on the bases of their Id
app.get("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      let user = users[0];
      res.render("edit.ejs", {user});
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

//Route to updata data
app.patch("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let {username: newUserName , password : formPass} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      let user = users[0];
      if(formPass != user.password) {
        res.send("Wrong Password");
      } else {
        let q2 = `UPDATE user SET username = '${newUserName}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

app.get("/user/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/user/add", (req, res) => {
  let {username: newUserName, email: newEmail, password: newPassword} = req.body;
  let newUserId = faker.string.uuid();
  try{
    let q3 = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
    let obj = [`${newUserId}`, `${newUserName}`,`${newEmail}`, `${newPassword}`];
    connection.query(q3, obj, (err, result) => {
      if(err) throw err;
      res.redirect("/user");
      console.log(result);
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

app.get("/user/del", (req, res) => {
  res.render("delete.ejs");
});

app.post("/user/del", (req, res) => {
  let {email: useremail, password: userpass} = req.body;
  let q = `SELECT * FROM user WHERE email='${useremail}'`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      let user = users[0];
      if(user.email === useremail && user.password === userpass) {
        let q4 = `DELETE FROM user WHERE email = '${useremail}'`;
        connection.query(q4, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
          console.log(result);
        });
      } else {
        let respone = "<h1>Wrong! Email and Password</h1>";
        res.send(respone);
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in Database");
  }
});

// for fake data insert
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data = [];
// for(let i=1; i<=100; i++) {
//   data.push(createRamdomUser());
// }


// connection for mysql
// try {
//   connection.query(q, [data], (err, users) => {
//     if (err) throw err;
//     console.log(users);
//   });
// } catch (err) {
//   console.log(err);
// }

// connection.end();