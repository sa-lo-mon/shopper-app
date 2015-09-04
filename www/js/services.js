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
