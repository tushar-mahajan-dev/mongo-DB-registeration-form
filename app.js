// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const app = express();

// // Connect to MongoDB
// mongoose.connect('mongodb://127.0.0.1/contact_data', { useNewUrlParser: true });

// // Create a Mongoose schema
// const contactSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
// });

// const Contact = mongoose.model('Contact', contactSchema);

// app.use(bodyParser.urlencoded({ extended: true }));

// // Serve the homepage
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>Welcome to the Contact Form</h1>
//     <form action="/submit" method="post">
//       <label for="name">Name:</label>
//       <input type="text" id="name" name="name"><br>

//       <label for="email">Email:</label>
//       <input type="email" id="email" name="email"><br>

//       <label for="phone">Phone:</label>
//       <input type="tel" id="phone" name="phone"><br>

//       <input type="submit" value="Submit">
//     </form>
//   `);
// });

// // Handle form submissions
// app.post('/submit', (req, res) => {
//   const { name, email, phone } = req.body;

//   // Create a new contact document
//   const newContact = new Contact({ name, email, phone });

//   // Save it to MongoDB
//   newContact.save()
//   .then(() => {
//     res.send('Contact data saved successfully.');
//   })
//   .catch((err) => {
//     console.error(err);
//     res.status(500).send('Error saving contact data.');
//   });
// });

// app.listen(3000, () => {
//     console.log("server is running at port 3000");
// })






//import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');

//create express app
const app = express();

//connect to mongo db
mongoose.connect('mongodb://127.0.0.1/contact_data', {useNewUrlParser: true, useUnifiedTypology: true});

//create user model
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String,
});

//middleware 
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret: 'your-secret-key', resave: true, saveUninitialized:true}));
app.set('view engine', 'ejs'); //set ejs as template engine

//sign up form
app.get('/signup', (req,res)=>{
    res.render('signup');
});

//handle user registeration
app.post('/signup', async(req, res)=> {
    const{username, email, password} = req.body;

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create new user
    const user = new User({username, email, password: hashedPassword});

    //save user data to database
    await user.save();

    //redirect to login page
    res.redirect('/login');
});

//serve the login form

app.get('/login', (req,res)=>{
    res.render('signup');
});

//handle user registeration
app.post('/login', async(req, res)=> {
    const{username, password} = req.body;

    //find the user by name
    const user = await User.findOne({username});

    //check if user already exist
    if(!user){
        return res.status(401).send('invalid user name or password');
    }

    //compare the entered password

    const isPasswordValid = await  bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(401).send('invalid username or password');
    }

    //set session variable to indicate the user is login
    req.session.userId = user._Id;

    //redirect to the success page
    res.redirect('/profile');
});

//logout route
app.get('/logout', (req, res) => {
    //Destroy the session and redirect the login page
    req.session.destroy((err) =>{
        if(err){
            return res.status(500).send('error log out');
        }
        res.redirect('/login');
    });
});

//protected route
app.get('/profile', (req, res)=>{
    //check if user is authenticated
    if(!req.session.userId){
        return res.status(401).send('unauthorised');
    }

    //redirect to welcome page
    res.send("welcome to home page");
});

//start the server
app.listen(3000, ()=> {
    console.log("server is running on 3000");
})