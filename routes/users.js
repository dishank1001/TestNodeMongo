const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const uuid = require('uuid-random')
const url = require('url')

const keys = require('../config/key');

const User = require('../models/User');

const SecretCodes = require('../models/SecretCodes');

const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => {
    console.log(req.query.invitation)
    res.render('register',{
        value: req.query.invitation
    })
}); 

router.post('/register',(req,res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid){
      return res.status(400).json(errors);
  }  
  User.findOne({email:req.body.email}).then(user=>{

    if(user){
        return res.status(400).json({email:"Email already exists"});
    } else{
        const newUser = new User({
            name:req.body.name,
            password:req.body.password,
            email:req.body.email,
            invitation:req.body.invitation,
            indivPoints:0,
            invitationCode:uuid() //6bb39cce-ce19-4037-93c1-c26956f063d4
        });

        const newSecretUser = new SecretCodes({
            invitationCode: newUser.invitationCode,
            email: newUser.email
        })
        newSecretUser.save()
        SecretCodes.findOne({invitationCode: req.body.invitation})
            .then(() =>{
                User.findOneAndUpdate({invitationCode: req.body.invitation}, {$inc:{indivPoints: 5}}, {new: true}, (err, doc) => {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                });
            })

        // Hash password before storing in database
        const rounds  = 10;
        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
                .save()
                .then(res.redirect('/users/login'))
                .catch(err => console.log(err));
            });
        });
    }

    });
})

router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);
    if (!isValid) {
          return res.status(400).json(errors);
      }
      const email = req.body.email;
      const password = req.body.password;
  
      User.findOne({email}).then(user=>{
        if(!user){
            return res.status(404).json({ emailnotfound: "Email not found" });
        }
        bcrypt.compare(password, user.password).then(isMatch => {
          if (isMatch) {
              // Create JWT Payload
              const payload = {
                  id: user.id,
                  name: user.name
              } 
  
              // Sign token
              jwt.sign(
                  payload,
                  keys.secretOrKey,
                  {
                   expiresIn: 41512810 
                  }
              )
              res.render('dashboard', {
                  user:user
              })
          } else {
            return res
              .status(400)
              .json({ passwordincorrect: "Password incorrect" });
          }
        });
      });
    });

router.get('/logout', (req, res) => {
      req.logout();
     res.redirect('/users/login');
});

module.exports = router;

