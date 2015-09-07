var appControllers = angular.module('starter.controllers', []);

appControllers.controller('DashCtrl', function ($scope, UserService) {
  console.log('dash control. isLoggedIn = ', UserService.model.isLoggedIn);
});

appControllers.controller('ChatsCtrl', function ($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function (chat) {
    Chats.remove(chat);
  };
});

appControllers.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});

appControllers.controller('AccountCtrl', function ($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

appControllers.controller('LoginCtrl', function ($state, $scope, $http, $ionicPopup, UserService) {

  //init facebook sdk
  /*
   FB.init({
   appId: '421262201393188',
   channelUrl: 'app/channel.html',
   status: true,
   cookie: true,
   xfbml: true
   });
   */
  $scope.loginData = {};

  $scope.doLogin = function () {
    if ($scope.loginData.email && $scope.loginData.password) {
      $http.post('/login', $scope.loginData)
        .success(function (data) {
          UserService.loginRedirect(data);
        })
        .error(function (data) {
          $ionicPopup.alert({
            title: 'Login failed!',
            template: 'Please check your credentials!'
          });
        });
    } else {

      $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    }
  };

  $scope.logout = function () {

    UserService.logout();

    FB.getLoginStatus(function (res) {
      if (res.status === 'connected') {
        FB.logout(function (res) {
          console.log('facebook logged out!');
        });
      }
    });

    $location.path('/login');
  };
});

appControllers.controller('RegisterCtrl', function ($scope, $http, $state) {
  $scope.formData = {};

  $scope.sub = function () {
    console.log('form data: ', $scope.formData);
    $http.post('/register/complete', $scope.formData)
      .success(function (data) {

        console.log('posted successfully ', data);

        //redirect to 'categories' page
        $state.go('categories');
      })
      .error(function (err) {
        console.error('error in posting registration details: ', err);
        //TODO: show error message
      });
  }
});

appControllers.controller('CategoriesCtrl', function ($scope, $http, $state, $ionicPopup, UserService, Categories) {
  $scope.user = UserService;

  $scope.categories = [];
  $scope.userCategories = [];

  Categories.all().then(function (data, err) {
    if (err) {
      $ionicPopup.alert({
        title: 'Categories failed!',
        template: err
      });
    } else {
      $scope.categories = data;
      console.log('categories: ', $scope.categories);
    }
  });

  $scope.getCategories = function () {
    return $scope.userCategories;
  };

  $scope.check = function (value, checked) {

    var idx = $scope.userCategories.indexOf(value);

    if (idx >= 0 && !checked) {
      $scope.userCategories.splice(idx, 1);
    }

    if (idx < 0 && checked) {
      $scope.userCategories.push(value);
    }
  };

  $scope.sub = function () {
    if (!$scope.user.model.email) {
      $scope.user.restoreState();
    }
    var params = {
      email: $scope.user.model.email,
      categories: $scope.userCategories
    };
    console.log('params: ', params);

    $http.post('/categories/complete', params)
      .success(function (data) {
        console.log('data: ', data);

        //redirect to 'main' page
        $state.go('tab.dash');
      })
      .error(function (data) {
        console.error('error in posting categories/complete ', data);

        //TODO: show error message to user
      });
  }
});


appControllers.controller('MallsCtrl', function ($scope, Malls) {
  $scope.malls = Malls.all();
  $scope.remove = function (mall) {
    Malls.remove(mall);
  }
});

appControllers.controller('MySalesCtrl', function ($scope, MySales) {
  $scope.mysales = MySales.all();
  $scope.remove = function (sale) {
    MySales.remove(sale);
  }
});

appControllers.controller('SalesCtrl', function ($scope, Sales) {
  $scope.sales = Sales.all();
  $scope.remove = function (mall) {
    Malls.remove(mall);
  }
  $scope.add = function (sale){
    Sales.add(sale);
  }
});
appControllers.controller('SalesCtrlDetails', function ($scope, $stateParams, Sales) {
  $scope.sales = Sales.get($stateParams.saleId);
  /*    $scope.remove = function(mall) {
   Malls.remove(mall);
   }*/
});



