var appServices = angular.module('starter.services', []);

appServices.factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.splice(chats.indexOf(chat), 1);
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        }
    };
});

appServices.factory('Categories', function ($http, $q) {
    return {
        all: function () {
            var dfd = $q.defer();
            $http.get('/categories')
                .success(function (categories) {
                    dfd.resolve(categories.data);
                })
                .error(function (err) {
                    dfd.reject(err);
                });

            return dfd.promise;
        }
    };
});

appServices.factory('UserService', function ($rootScope, $http, $state, $ionicPopup) {
    var service = {
        model: {
            name: '',
            email: '',
            isLoggedIn: false
        },

        saveState: function () {
            sessionStorage.UserService = angular.toJson(service.model);
        },

        restoreState: function () {
            service.model = angular.fromJson(sessionStorage.UserService);
        },

        watchLoginChange: function () {
            var _self = this;
            FB.Event.subscribe('auth.statusChange', function (res) {
                if (res.status === 'connected') {
                    var userId = res.authResponse.userID;
                    var token = res.authResponse.accessToken;
                    _self.getUserInfo(userId, token);

                } else {
                    _self.logout();
                    console.log('not logged-in!');
                    $location.path('/login');
                }
            });
        },

        getUserInfo: function (userID, token) {
            var _self = this;
            $rootScope.$apply(function () {

                $http.get('/user' + '/' + userID + '/' + token)
                    .success(function (data) {
                        _self.loginRedirect(data);
                    })
                    .error(function (err) {
                        console.log('user info error: ', err);
                    });
            });
        },

        logout: function () {
            var _self = this;
            _self.model.email = '';
            _self.model.name = '';
            _self.model.isLoggedIn = false;
            _self.saveState();
        },

        loginRedirect: function (data) {
            var _self = this;
            if (!data || !data.data) {

                $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
                return;
            }

            _self.model.email = data.data.email || data.data.data.email;
            _self.model.name = data.data.FirstName || data.data.data.FirstName;
            _self.model.isLoggedIn = true;
            _self.saveState();
            var path = 'login';
            var userCategories = data.data.Categories || data.data.data.Categories;
            if (userCategories && userCategories.length > 0) {

                //redirect to "main" page!
                path = 'tab.sales';
            } else {

                //redirect to "categories" page!
                path = 'categories';
            }
            console.log('---6');
            $state.go(path);
        }
    };

    $rootScope.$on('savestate', service.saveState);
    $rootScope.$on('restorestate', service.restoreState);

    return service;
});

appServices.service('AuthService', function ($q, $http, USER_ROLES, LOGIN_TYPE, AUTH_EVENTS) {
    var LOCAL_TOKEN_KEY = 'tokenKey';
    var userName = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;

    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
        }
    };

    function isValidUser(loginData) {
        return $q(function (resolve, reject) {
            if (loginData.username && loginData.password) {
                //Get user credentials from database
                $http.post('/login', loginData)
                    .success(function (data) {
                        resolve(data);
                    })
                    .error(function (err) {
                        reject(err);
                    });
            } else {
                reject('Invalid Login Details.');
            }
        });
    }

    function storeUserCredentials(token) {
        console.log(token);
        /* var user = {};
         user.name = response.name;
         user.email = response.email;
         if (response.gender) {
         response.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
         } else {
         user.gender = '';
         }
         user.profilePic = picResponse.data.url;

         window.localStorage.setItem('userInfo', user);

         console.log('user.profilePic: ', user.profilePic);
         */
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        useCredentials(token);
    };

    function useCredentials(token) {
        console.log('useCredentials');
        userName = token.split('.')[0];
        isAuthenticated = true;
        authToken = token;

        if (userName == 'admin') {
            role = USER_ROLES.admin;

        }/* else if (userName == 'user') {
         role = USER_ROLES.public;
         }*/
        else {
            console.log('public role');
            role = USER_ROLES.public;
        }

        $http.defults.headers.common['X-Auth-Token'] = token;
    };

    function destroyCredentials() {
        var userName = '';
        var isAuthenticated = false;
        var role = '';
        var authToken = undefined;
        $http.defults.headers.common['X-Auth-Token'] = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    function loginRedirect(data) {
        var _self = this;
        if (!data || !data.data) {

            $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
            return;
        }

        _self.model.email = data.data.email || data.data.data.email;
        _self.model.name = data.data.FirstName || data.data.data.FirstName;
        _self.model.isLoggedIn = true;
        _self.saveState();
        var path = 'login';
        var userCategories = data.data.Categories || data.data.data.Categories;
        if (userCategories && userCategories.length > 0) {

            //redirect to "main" page!
            path = 'tab.sales';
        } else {

            //redirect to "categories" page!
            path = 'categories';
        }
        console.log('---6');
        $state.go(path);
    }

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }

        return (isAuthenticated && authorizedRoles.indexf(role) != -1);
    };


    function getUserInfo() {
        return $q(function (resolve, reject) {

            // get basic info
            FB.api('/me', function (response, err) {

                if (err) {
                    reject(err);

                } else {

                    // store data to DB - Call to API
                    // Todo
                    // After posting user data to server successfully store user data locally
                    resolve(response);
                }
            });
        });
    }

    // FB Login
    var facebookLogin = function () {
        return $q(function (resolve, reject) {
            FB.login(function (response) {
                if (response.authResponse) {
                    resolve(getUserInfo());
                } else {
                    reject('User cancelled login or did not fully authorize.');
                }
            }, {scope: 'email, public_profile'});
        });
    };
    // END FB Login

    var defaultLogin = function (loginData) {
        return isValidUser(loginData);
    };

    var loginHandler = function (loginData, loginType) {
        if (loginType == LOGIN_TYPE.facebook) {
            return facebookLogin();

        } else if (loginType == LOGIN_TYPE.default) {
            return defaultLogin(loginData);

        } else {
            return $q.defer().reject();
        }
    };

    var login = function (loginData, loginType) {
        loginHandler(loginData, loginType).then(function (data, err) {
            if (err) {
                console.log('login error: ', err);
                $rootScope.broadcost(AUTH_EVENTS.notAuthorized);

            } else {
                storeUserCredentials(data);
            }
        });
    };

    var logout = function () {
        destroyCredentials();
    };

    loadUserCredentials();

    return {
        login: login,
        logout: logout,
        isAuthorized: isAuthorized,
        isAuthenticated: function () {
            return isAuthenticated;
        },
        userName: function () {
            return userName;
        },
        role: function () {
            return role;
        }
    };
});

appServices.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: function (response) {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
                403: AUTH_EVENTS.notAuthorized
            }[response.status], response);
            return $q.reject(response);
        }
    };

});
