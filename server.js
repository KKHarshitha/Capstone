const express = require('express')
const app = express()
const port = 8000
const request = require("request");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
var bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
var ph=require('password-hash');
var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get('/proj', (req, res) => {
  res.render("signup");
})

app.post('/signupsubmit', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const pwd = req.body.pwd;
  db.collection("users")
            .where('email', '==', email)
            .get()
            .then((docs) => {
                if (docs.size > 0) {
                    res.send( "User with email id already exists");    
                } else {
                    db.collection("users")
                  .add({
      name: name,
      email: email,
      password: ph.generate(pwd),
    })
                    .then(()=>{
                        res.redirect('/signin');
                    })
                }
            });
    });
  


app.get('/signin', (req, res) => {
  res.render("signin");
});


app.post('/signinsubmit', (req, res) => {
  const email = req.body.email;
  const password = req.body.pwd;
  db.collection("users")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      let verified=false;
      docs.forEach(doc=>{
        verified=ph.verify(password,doc.data().password);
      })
      if (verified) {
        //query my database with all the users only when login is succefull
          res.render("proj");
      } 
    });      
});

app.get('/projsubmit',(req,res) =>{
    // You can serve a static HTML page for mythology content
    res.sendFile(__dirname + '/views/proj.ejs');
  
});
app.get('/home.ejs', (req, res) => {
  res.render('home'); // Assuming 'home.ejs' is in the 'views' directory
});
app.get('/cat.ejs', (req, res) => {
  res.render('cat'); // Assuming 'home.ejs' is in the 'views' directory
});
app.get('/trees.ejs', (req, res) => {
  res.render('trees'); // Assuming 'home.ejs' is in the 'views' directory
});
app.get('/us.ejs', (req, res) => {
  res.render('us'); // Assuming 'home.ejs' is in the 'views' directory
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})