/**
 * Created by ziv on 23/7/2015.
 */
var FB = require('fb');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var facebookToDB = require('./www/js/facebookToDB.js');
var app = express();
var mongoAccessLayer = require('./www/js/mongoAccessLayer.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/www'));

app.post('/login', function (req, res) {
    if (req.body.password && req.body.email) {
        console.log('login 1');
        var loginInput = {
            user_name: req.body.email,
            password: req.body.password
        };

        facebookToDB.validateUser(loginInput, function (err, data) {
            if (err) {
                console.log('login 2');
                res.json({success: false, data: null, message: err.message});

            } else if (data && data.valid) {
                console.log('login 3');
                res.json({success: true, data: data});

            } else {
                console.log('login 4');
                //user not exist or password is incorrect
                res.json({success: false, data: null, message: 'Please check your input!'});
            }
        });

    } else {
        console.log('login 5');
        res.json({success: false, data: null, message: "Invalid Request!"});
    }
});

app.post('/register/complete', function (req, res) {
    var userDocument = {
        "FirstName": req.body.firstname,
        "LastName": req.body.lastname,
        "email": req.body.email,
        "Password": req.body.password,
        "birthyear": req.body.birthyear,
        "city": req.body.city,
        "gender": req.body.gender
    };

    facebookToDB.checkUser(userDocument, function (err, data) {
        if (err) {
            res.send('check user - error!!');
        } else if (data) {
            res.send('User with same email already exist!');
        } else {
            mongoAccessLayer.insertDocument('users', userDocument, function (err, data) {
                if (err) {
                    console.log("could not create user!");
                    console.log("error details: ", err);
                    res.send('error while registration!');
                } else {
                    console.log("new user created");
                    console.log(data);
                    res.send('registration ended successfully!');
                }
            });
        }
    });
});

app.get('/user/:id/:accessToken', function (req, res) {
    if (req.params.id) {
        var params = {
            access_token: req.params.accessToken,
            fields: ['name', 'first_name', 'last_name', 'email', 'id']
        };

        FB.napi('/' + req.params.id, params, function (err, response) {
            if (err) {
                res.json({success: false, data: null, message: err.message});

            } else {
                facebookToDB.checkUser(response, function (err, data) {
                    if (err) {
                        res.json({success: false, data: null, message: err.message});

                    } else if (data) {
                        res.json({success: true, data: data});

                    } else {
                        facebookToDB.insertUser(response, function (err, data) {
                            if (err) {
                                res.json({success: false, data: null, message: err.message});

                            } else {
                                res.json({success: true, data: data});
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json({success: false, data: null, message: "Invalid Request!"});
    }
});

var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});