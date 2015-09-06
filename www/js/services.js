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

                $http.get('/login' + '/' + userID + '/' + token)
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

appServices.service('AuthService', function ($q, $http, USER_ROLES) {
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

    function isValidUser(userName, pw) {
        var params = {username: userName, password: pw};

        return $q(function (resolve, reject) {

            //Get user credentials from database
            $http.post('/login', params)
                .success(function (data) {
                    resolve(data);
                })
                .error(function (err) {
                    reject(err);
                });
        });
    }

    function storeUserCredentials(token) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        useCredentials(token);
    };

    function useCredentials(token) {
        userName = token.split('.')[0];
        isAuthenticated = true;
        authToken = token;

        if (userName == 'admin') {
            role = USER_ROLES.admin;

        } else if (userName == 'user') {
            role = USER_ROLES.public;
        }

        $http.defults.headers.common['X-Auth-Token'] = token;
    };

    var login = function (name, pw) {

        return $q(function (resolve, reject) {
            isValidUser(name, pw)
                .success(function (data) {
                    console.log('data: ', data);
                    storeUserCredentials(name + '.ServerTokenKey');
                    resolve('Login success.');
                })
                .error(function (err) {
                    console.log('err: ', err);
                    reject('Login failed.');
                });
        })
    };

    function destroyCredentials() {
        var userName = '';
        var isAuthenticated = false;
        var role = '';
        var authToken = undefined;
        $http.defults.headers.common['X-Auth-Token'] = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }

        return (isAuthenticated && authorizedRoles.indexf(role) != -1);
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
