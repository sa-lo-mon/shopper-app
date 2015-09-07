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

appServices.service('AuthService', function ($rootScope, $state, $q, $http, USER_ROLES, LOGIN_TYPE, AUTH_EVENTS) {
    var LOCAL_TOKEN_KEY = 'tokenKey';
    var LOCAL_CATEGORIES_KEY = 'categoriesKey';
    var userName = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;

    function useCredentials(token) {
        userName = token.split('.')[0];
        isAuthenticated = true;
        authToken = token.split('.')[1];

        if (userName == 'admin') {
            role = USER_ROLES.admin;
        } else {

            role = USER_ROLES.public;
        }

        $http.defaults.headers.common['X-Auth-Token'] = authToken;

    };

    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
            loginRedirect();
        } else {
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
    };

    function isValidUser(loginData) {
        return $q(function (resolve, reject) {
            console.log('login data: ', loginData);
            if (loginData.email && loginData.password) {

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

    function storeUserCredentials(userData) {
        console.log('user data: ', userData);
        if (!userData.data) {
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            return;
        }
        var email = userData.data.email || userData.data.data.email;
        userName = userData.data.FirstName || userData.data.data.FirstName;
        var categories = userData.data.Categories || userData.data.data.Categories;
        var token = userName + '.' + email;

        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        window.localStorage.setItem(LOCAL_CATEGORIES_KEY, categories);
        useCredentials(token);
    };


    function destroyCredentials() {
        var userName = '';
        var isAuthenticated = false;
        var role = '';
        var authToken = undefined;
        $http.defults.headers.common['X-Auth-Token'] = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    function loginRedirect() {
        var path = 'login';
        var userCategories = window.localStorage.getItem(LOCAL_CATEGORIES_KEY);
        if (userCategories && userCategories.length > 0) {

            //redirect to "main" page!
            path = 'tab.sales';
        } else {

            //redirect to "categories" page!
            path = 'categories';
        }
        $state.go(path);
    }

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }

        return (isAuthenticated && authorizedRoles.indexf(role) != -1);
    };

    function getUserInfo(userID, token) {
        return $http.get('/user' + '/' + userID + '/' + token);
    }


    var facebookLogin = function () {
        return $q(function (resolve, reject) {
            FB.login(function (res) {
                if (res.authResponse) {
                    var userId = res.authResponse.userID;
                    var token = res.authResponse.accessToken;
                    getUserInfo(userId, token).then(function (data, err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                } else {
                    reject('User cancelled login or did not fully authorize.');
                }
            }, {scope: 'email, public_profile'});
        });
    };

    var defaultLogin = function (loginData) {
        return isValidUser(loginData);
    };

    var loginHandler = function (loginData, loginType) {
        if (loginType == LOGIN_TYPE.facebook) {
            return facebookLogin();

        } else if (loginType == LOGIN_TYPE.default) {
            return defaultLogin(loginData);

        } else {
            return $q.reject('login error!');
        }
    };

    var login = function (loginData, loginType) {

        loginHandler(loginData, loginType).then(function (data, err) {
            if (err) {
                console.log('login error: ', err);
                isAuthenticated = false;
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            } else {
                isAuthenticated = true;
                storeUserCredentials(data);
                loginRedirect();
            }
        });
    };

    var logout = function () {
        destroyCredentials();
    };

// this will occur every time
// that user will open the application
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

appServices.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});