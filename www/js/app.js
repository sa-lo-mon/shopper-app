var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services']);

app.run(function ($ionicPlatform, $window, UserService) {

    $ionicPlatform.ready(function () {

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        // Facebook SDK
        $window.fbAsyncInit = function () {
            // Executed when the SDK is loaded

            FB.init({
                appId: '421262201393188',
                channelUrl: 'www/channel.html',
                status: true,
                cookie: true,
                xfbml: true
            });

            UserService.watchLoginChange();
        };

        (function (d) {
            // load the Facebook javascript SDK

            var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                return;
            }

            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "https://connect.facebook.net/en_US/all.js";

            ref.parentNode.insertBefore(js, ref);

        }(document));
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })

        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
        })

        .state('categories', {
            url: '/categories',
            templateUrl: 'templates/categories.html',
            controller: 'CategoriesCtrl'
        })

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        })

        // Each tab has its own nav history stack:
        .state('tab.dash', {
            url: '/dash',
            views: {
                'tab-dash': {
                    templateUrl: 'templates/tab-dash.html',
                    controller: 'DashCtrl'
                }
            }
        })

        .state('tab.chats', {
            url: '/chats',
            views: {
                'tab-chats': {
                    templateUrl: 'templates/tab-chats.html',
                    controller: 'ChatsCtrl'
                }
            }
        })

        .state('tab.chat-detail', {
            url: '/chats/:chatId',
            views: {
                'tab-chats': {
                    templateUrl: 'templates/chat-detail.html',
                    controller: 'ChatDetailCtrl'
                }
            }
        })

        .state('tab.account', {
            url: '/account',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-account.html',
                    controller: 'AccountCtrl'
                }
            }
        })

        .state('tab.logout', {
            url: '/logout',
            views: {
                'tab-logout': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })

        .state('tab.sales-general', {
            url: '/sales/general',
            views: {
                'tab-sales-general': {
                    templateUrl: 'templates/sales.html',
                    controller: 'SalesCtrl'
                }
            }
        })

        .state('tab.sales-private', {
            url: '/sales/private',
            views: {
                'tab-sales-private': {
                    templateUrl: 'templates/sales.html',
                    controller: 'SalesCtrl'
                }
            }
        })

        .state('tab.mall-map', {
            url: '/mall/map',
            views: {
                'tab-mall-map': {
                    templateUrl: 'templates/mall.html',
                    controller: 'MallCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'request': function (config) {
                var url = config.url;

                //if url doesn't contains '.html'
                if (url.indexOf('.html') == -1) {
                    config.url = 'https://shopper-server.herokuapp.com' + config.url;
                    console.log('config url: ', config.url);
                }

                return config || $q.when(config);
            }
        }
    });
});