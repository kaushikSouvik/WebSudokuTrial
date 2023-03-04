require('dotenv').config()
// import dotenv from "dotenv";
// dotenv.config();
//import express from "express";
const express= require("express");
const app= express();
//import bodyParser from "body-parser";
const bodyParser= require("body-parser")
//import mongoose from "mongoose";
const mongoose= require('mongoose');
const encrypt= require('mongoose-encryption')
//import session from "express-session";
const session= require('express-session');
//import passport from "passport";
const passport= require("passport");
//import passportLocalMongoose from "passport-local-mongoose";
const passportLocalMongoose= require("passport-local-mongoose");
//import { title } from "process";
//import pkg from "passport";
//const { use } =pkg 
const { title } = require("process");
const { use } = require('passport');

//const express= require("express");
//const bodyParser= require("body-parser");
//const app= express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'public'));
app.set("view engine", "ejs")

mongoose.set('strictQuery', true);

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//use passport to start authentication
app.use(passport.initialize());

//use passport to set up a session
app.use(passport.session());

//const uri= process.env.URI;
//mongoose.connect(uri, {useNewUrlParser: true}); 

mongoose.connect("mongodb://0.0.0.0:27017/sudokuDb", {useNewUrlParser: true}); 

//-------------------------------SCHEMA----------------------------------
const userSchema= new mongoose.Schema({
    username: String,
    password: String
});


const recordSchema= new mongoose.Schema({
    difficulty: String,
    date: String,
    timer: String,
    life: String,
    userId: String
});

//-------------------------------MODEL--------------------------

//plugin..for salting and hashing and store the user to db
userSchema.plugin(passportLocalMongoose);


const User= new mongoose.model("User", userSchema);
const Record= new mongoose.model("Record", recordSchema);

//passportLocalMongoose codes
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//--------------------------------




//------------------------------------HOME ROUTE----------------------------------------
app.route("/")
    .get(function(req, res){
        res.render("home", {isItAuthenticated: req.isAuthenticated()});
    });
   
//------------------------------------REGISTER/SIGNUP ROUTE---------------------------------
app.route("/signup")
    .get(function(req, res){
        if(req.isAuthenticated())   res.redirect("/");
        else    
            res.render("signupuser", {isItAuthenticated: req.isAuthenticated()});
    })

    .post(function(req, res){
        //no need to use findOne() and check if user registered in past..USer.register gives the error when user is already registered in past
        User.register({username: req.body.username}, req.body.password, function(err, user){
            if(err){
                console.log(err);
                res.render("register", {isItAuthenticated: false,err: true});
            }
            else{
                passport.authenticate("local", {failureRedirect: '/register'})(req, res, function(){
                    //res.locals.user= req.user;
                    res.redirect("/secrets");
                });
            }
        });
    });

//-----------------------------------------LOGIN ROUTE-------------------------------------
app.route("/login")
    .get(function(req, res){
        if(req.isAuthenticated()){
            //when user is authenticated,there is no point in showing login page 
            res.redirect("/");
        }
        else{
            res.render("login", {isItAuthenticated: false, err: false});
        }
    })

    .post(function(req, res){
        const user= new User({
            username: req.body.username,
            password: req.body.password
        })
        passport.authenticate('local', function(err, user, info) {
    
            if(err) { res.render('login', {err: true, isItAuthenticated: false}); }
            if(user){
                req.logIn(user, function(err) {
                    if (err) { res.render('login', {err: true, isItAuthenticated: false}); }
                    else {
                        //res.locals.user= req.user;
                        res.redirect('/secrets');
                    }
                });
            }
            else{ 
                //Incorrect credentials, hence redirect to login 
                return res.render('login', {err: true, isItAuthenticated: false});; 
            }
            
        })(req, res);
    });

//-------------------------------------LOG OUT ROUTE---------------------------

app.route("/logout")
    .get(function(req, res){
        if(req.isAuthenticated()){
            req.logout(function(err){
                if(err) console.log(err);
            });
            res.redirect("/");
        }
        else{
            //when user is not authenticated,then they can't access the logout route
            res.redirect("/login");
        }
    });

//------------------------------------NEW GAME ROUTE----------------------------
    app.route("/newgame")
    .get(function(req, res){
        if(req.isAuthenticated()){
            res.render("newgame");
        }
        else{
            res.render("/login", {isItAuthenticated: false});
        }
    });

//------------------------------------START GAME ROUTE------------------------------------
    app.route("/startgame")
    .get(function(req, res){
        
    });

//------------------------------------RESULT ROUTE-----------------------------------------
    app.route("/result")
    .get(function(req, res){
        
    });

//------------------------------------RECORDS ROUTE
    app.route("/records")
    .get(function(req, res){
        
    });

    app.route("/developercontacts")
    .get(function(req, res){
        res.render("developercontacts");
    });

    app.route("/howtoplay")
    .get(function(req, res){
        
    })






//--------------------------------------TESTING-------------------------------------------------------------------------------

app.route("/testing")
    .get(function(req, res){
        res.render("home", {isItAuthenticated: true});
    });
//------------------------------------REGISTER/SIGNUP ROUTE---------------------------------
app.route("/testing/signup")
.get(function(req, res){
    if(req.isAuthenticated())   res.redirect("/");
    else    
        res.render("signupuser", {isItAuthenticated: req.isAuthenticated()});
})

.post(function(req, res){
    //no need to use findOne() and check if user registered in past..USer.register gives the error when user is already registered in past
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.render("register", {isItAuthenticated: false,err: true});
        }
        else{
            passport.authenticate("local", {failureRedirect: '/testing/register'})(req, res, function(){
                //res.locals.user= req.user;
                res.redirect("/testing");
            });
        }
    });
});

//-----------------------------------------LOGIN ROUTE-------------------------------------
app.route("/testing/login")
.get(function(req, res){
    if(req.isAuthenticated()){
        //when user is authenticated,there is no point in showing login page 
        res.redirect("/testing");
    }
    else{
        res.render("login", {isItAuthenticated: false, err: false});
    }
})

.post(function(req, res){
    const user= new User({
        username: req.body.username,
        password: req.body.password
    })
    passport.authenticate('local', function(err, user, info) {

        if(err) { res.render('login', {err: true, isItAuthenticated: false}); }
        if(user){
            req.logIn(user, function(err) {
                if (err) { res.render('login', {err: true, isItAuthenticated: false}); }
                else {
                    //res.locals.user= req.user;
                    res.redirect("/testing");
                }
            });
        }
        else{ 
            //Incorrect credentials, hence redirect to login 
            return res.render('login', {err: true, isItAuthenticated: false});; 
        }
        
    })(req, res);
});

//-------------------------------------LOG OUT ROUTE---------------------------

app.route("/testing/logout")
.get(function(req, res){
    if(req.isAuthenticated()){
        req.logout(function(err){
            if(err) console.log(err);
        });
        res.redirect("/testing");
    }
    else{
        //when user is not authenticated,then they can't access the logout route
        res.redirect("/testing/login");
    }
});

//------------------------------------NEW GAME ROUTE----------------------------
app.route("/testing/newgame")
.get(function(req, res){
    if(req.isAuthenticated()){
        res.render("newgame");
    }
    else{
        res.render("/testing/login", {isItAuthenticated: false});
    }
});

    app.route("/testing/newgame")
    .get(function(req, res){
        
    });

    app.route("/testing/startgame")
    .get(function(req, res){
        
    })

    app.route("/testing/result")
    .get(function(req, res){
        
    })

    app.route("/testing/records")
    .get(function(req, res){
        
    })

    app.route("/testing/developercontacts")
    .get(function(req, res){
        
    })

    app.route("/testing/howtoplay")
    .get(function(req, res){
        
    })








app.listen(3000, function(){
    console.log("At port 3000");
})