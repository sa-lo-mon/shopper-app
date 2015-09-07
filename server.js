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

app.post('/categories/complete', function (req, res) {
    var cariteria = {
        condition: {email: req.body.email},
        setValues: {Categories: req.body.categories}
    };

    mongoAccessLayer.updateDocument("users", cariteria, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
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

app.get('/categories', function (req, res) {
    mongoAccessLayer.getCollection('categories', {}, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});
        }
        else {
            res.json({success: true, data: data, message: null});
        }
    })
});

function tmpInsert(){
    var documentArray = [{
        Id: 0,
        name: '???? ???????',
        lat: '32.164984',
        long: '34.823771',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        Id: 1,
        name: '????? ???????',
        lat: '32.164984',
        long: '34.444771',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        Id: 2,
        name: '???? ??????',
        lat: '32.555584',
        long: '34.823771',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        Id: 3,
        name: '????',
        lat: '30.164984',
        long: '34.823771',
        face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
    }, {
        Id: 4,
        name: '???????',
        lat: '32.555984',
        long: '34.223771',
        face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];
    console.log('insert');
    mongoAccessLayer.batchInsert('malls', documentArray, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
}

function tmpUpdate(){
    var sales = {"sales" :[
        {
        id: 0,
        name: '50% on NIKE',
        details: '50%',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        details: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    },{
        id: 2,
        name: 'Adam Bradleyson',
        details: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 3,
        name: 'Perry Governor',
        details: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
    }, {
        id: 4,
        name: 'Mike Harrington',
        details: 'This is wicked good ice cream.',
        face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }]};

    var criteria ={};
    criteria.condition = {"Id" : 0};
    criteria.setValues = sales;


    mongoAccessLayer.updateDocument('malls', criteria, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });

}

app.get('/mallList', function (req, res) {
    mongoAccessLayer.getCollection('malls', {}, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});
        }
        else {
            res.json({success: true, data: data, message: null});
        }
    })
});

app.post('/addToMySales', function (req, res) {
    var cariteria = {
        condition: {email: "test@gmail.com"},
        setValues: {sales: req.sale}
    };

    mongoAccessLayer.updateDocument("users", cariteria, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
});

app.post('/removeFromMySales', function (req, res) {
    var cariteria = {
        condition: {email: "test@gmail.com"},
        setValues: {sales: req.sales}
    };

    mongoAccessLayer.updateDocument("users", cariteria, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
});


var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});
//tmpUpdate();
