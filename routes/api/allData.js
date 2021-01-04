const express = require('express')
const router = express.Router()

const User = require('../../models/User');


router.get('/get-users-code', (req, res) => {
    User.find({},(err,results) => {
        if(err){
            console.log(err);
        }else{
            res.send(results)
        }
    })
})

router.get('/get-users-code/:invitation', (req, res) => {

    User.find({invitation: req.params.invitation},(err,results) => {
        if(err){
            console.log(err);
        }else{
            res.send(results)
        }
    })
})

router.get('/get-users-with-friends', (req, res) => {

    User.find({})
        .then((users) => {
            let userWithInvitation = {}

            users.forEach(e => {

                User.find({invitation: e.invitationCode}, (err,doc) => {
                    if(err){
                        console.log(err)
                    }else{
                       console.log(doc)
                    }
                })
            })
        })
        .catch(err => {
            console.log(err);
        })
})

module.exports = router