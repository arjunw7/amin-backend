var app = angular.module('sasitravels',['ngRoute', 'ngResource']).run(function($rootScope, $http){
  $http.get('auth/confirm-login')
        .success(function (user) {
            if (user) {
                $rootScope.current_user_name = user.fullName;
                $rootScope.authenticated = true;
            }
        });
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
  $rootScope.current_user_name = '';
  $rootScope.current_otp = '';
  $rootScope.booking_id = '';
});

app.config(function($routeProvider, $locationProvider, $httpProvider){
    //================================================
    // Check if the user is connected
    //================================================
  var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('auth/isAuthenticated').success(function(user){
        // Authenticated
        if (user !== '0')
          /*$timeout(deferred.resolve, 0);*/
          deferred.resolve();

        // Not Authenticated
        else {
          deferred.reject();
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

      var checkLoggedout = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('auth/isAuthenticated').success(function(user){
        // Authenticated
        if (user == '0')
          /*$timeout(deferred.resolve, 0);*/
          deferred.resolve();

        // Not Authenticated
        else {
          deferred.reject();
          $location.url('/home');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
  $routeProvider
    //homepage display
    .when('/', {
      templateUrl: 'partials/main.html',
      controller: 'authController',
    })
    .when('/home', {
      templateUrl: 'partials/main.html',
      controller: 'authController',
      resolve: {
        
      }
    })
    //the login display
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'authController',
      resolve: {
        loggedin: checkLoggedout
      }
    })
    //the signup display
    .when('/signup', {
      templateUrl: 'partials/signup.html',
      controller: 'authController',
      resolve: {
        loggedin: checkLoggedout
      }
    })
    //the forgot password display
    .when('/forgot', {
      templateUrl: 'partials/forgot.html',
      controller: 'authController',
      resolve: {
        loggedin: checkLoggedout
      }
    })
    //reset password display
    .when('/reset/:token', {
      templateUrl: 'partials/reset.html',
      controller: 'authController',
      resolve: {
       loggedin: checkLoggedout 
      }
    })

    //travel packages display
    .when('/package', {
      templateUrl: 'partials/package.html',
      controller: 'authController'
    }) 

    //contact page display
    .when('/contact', {
      templateUrl: 'partials/contact.html',
      controller: 'authController'
    })

    //profile display
    .when('/profile', {
      templateUrl: 'partials/profile.html',
      controller: 'authController',
      resolve: {
       loggedin: checkLoggedin 
      }
    })
    //booking history display
    .when('/bookingHistory', {
      templateUrl: 'partials/history.html',
      controller: 'authController',
      resolve: {
       loggedin: checkLoggedin 
      }
    })

    .when('/book', {
      templateUrl: 'partials/booking.html',
      controller: 'authController',
      resolve: {
       loggedin: checkLoggedin 
      }
    });
});

app.controller('authController', function($scope, $http, $rootScope, $location, $routeParams, $window){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $rootScope.current_user_name = data.user.fullName;
        $location.path('/');
      }
      else{
        angular.element(".text-warning").css({'display':'block'});
        angular.element('.text-warning img').click(function(){
          angular.element('.text-warning').hide();
        });
        $scope.error_message = data.message;

      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        angular.element(".text-warning").css({'display':'block'});
        angular.element('.text-warning img').click(function(){
          angular.element('.text-warning').hide();
        });
        $scope.error_message = data.message;
      }
    });
  };


   $scope.signout = function(){
     $http.get('auth/signout');
     $rootScope.authenticated = false;
     $rootScope.current_user = '';
     $location.path('/');
     };

    $scope.forgot = function(){
      $http.post('/api/forgot', $scope.user);
      alert('An e-mail has been sent to your email with further instructions');
      $location.path('/login');
    };

    $scope.resetPassword = function(){
        $http.post('/api/reset/' + $routeParams.token, $scope.user, $routeParams.token).success(function(){
        alert('Password reset succesful');
        $location.path('/login');
        });
    };
    $scope.addBooking = function(current_user){
      $rootScope.otp = Math.floor((Math.random() * 10000) + 1);
      $scope.newBooking = {bookingType: $scope.booking.bookingType, journeyType: $scope.booking.journeyType, pickupLocation: $scope.booking.pickupLocation, dropLocation: $scope.booking.dropLocation,  departDate: $scope.booking.departDate, returnDate: $scope.booking.returnDate, departTime: $scope.booking.departTime, returnTime: $scope.booking.returnTime, passengers: $scope.booking.passengers, carType: $scope.booking.carType, customerName: $scope.booking.customerName, customerEmail: $scope.booking.customerEmail, customerContact: $scope.booking.customerContact, customerAddress: $scope.booking.customerAddress, userId: current_user, otp: $rootScope.otp };
      $http.post('api/booking', $scope.newBooking).success(function(data){
        console.log(data);
        $rootScope.booking_id = data._id;
       angular.element(".otp").css({'display': 'block'});
       angular.element(".book-form :input").prop("disabled", true);
        alert("Please enter the one time Password sent on your mobile number to confirm the booking.");
       console.log("done");
      });
    };

    $scope.verifyOTP = function(){
      if($scope.enteredOTP==$rootScope.otp){
        console.log("OTP verified");
        $scope.link = 'https://www.instamojo.com/arjunw7/sasi-travels/?data_name=' + $scope.booking.customerName + '&data_email=' + $scope.booking.customerEmail + '&data_phone=' + $scope.booking.customerContact + '&data_Field_56979=' + $rootScope.booking_id + '&data_readonly=data_name&data_readonly=data_email&data_readonly=data_phone&data_readonly=data_amount&data_readonly=data_Field_56979';
        console.log($scope.link);
       angular.element(".OTPform :input").prop("disabled", true);
        angular.element(".payment").css({"display": "block"});
        angular.element("a.im-checkout-btn").attr("href",$scope.link);
      }
      else
        angular.element(".incorrectOTP").css({"display":"block"})

    }



  $scope.load = function() {

      //animateSlider() function definition
       $scope.animateSlider = function(){
        angular.element(".sliderItem1, .sliderItem3").delay(5000).animate({'opacity':'0'},500);
        angular.element(".sliderItem2").delay(5000).animate({'opacity':'1'},500);

        angular.element(".sliderItem1, .sliderItem2").delay(5000).animate({'opacity':'0'},500);
        angular.element(".sliderItem3").delay(5000).animate({'opacity':'1'},500);

        angular.element(".sliderItem2, .sliderItem3").delay(5000).animate({'opacity':'0'},500);
        angular.element(".sliderItem1").delay(5000).animate({'opacity':'1'},500);
      }
      //animateSlider() function Call
        $scope.animateSlider();
        $scope.repeat = setInterval($scope.animateSlider, 15000);

      $scope.animatePackages1 = function(){
        angular.element(".goa").delay(5500).animate({"opacity": "1"}, 800);
        angular.element(".coorgInside").delay(5500).animate({"opacity": "0"}, 800);
        
        angular.element(".goa").delay(5500).animate({"opacity": "0"}, 800);
        angular.element(".coorgInside").delay(5500).animate({"opacity": "1"}, 800);
      }
      $scope.animatePackages1();
       $scope.repeat = setInterval($scope.animatePackages1, 5500);

       $scope.animatePackages2 = function(){
        angular.element(".kodaikanal").delay(6000).animate({"opacity": "1"}, 800);
        angular.element(".pondiInside").delay(6000).animate({"opacity": "0"}, 800);
        
        angular.element(".kodaikanal").delay(6000).animate({"opacity": "0"}, 800);
        angular.element(".pondiInside").delay(6000).animate({"opacity": "1"}, 800);
      }
      $scope.animatePackages2();
       $scope.repeat = setInterval($scope.animatePackages2, 6000);

       $scope.animatePackages3 = function(){
        angular.element(".kanyakumari").delay(5000).animate({"opacity": "1"}, 800);
        angular.element(".ootyInside").delay(5000).animate({"opacity": "0"}, 800);
        
        angular.element(".kanyakumari").delay(5000).animate({"opacity": "0"}, 800);
        angular.element(".ootyInside").delay(5000).animate({"opacity": "1"}, 800);
      }
      $scope.animatePackages3();
       $scope.repeat = setInterval($scope.animatePackages3, 5000);

       $scope.animatePackages4 = function(){
        angular.element(".munnar").delay(4000).animate({"opacity": "1"}, 800);
        angular.element(".mysoreInside").delay(4000).animate({"opacity": "0"}, 800);
        
        angular.element(".munnar").delay(4000).animate({"opacity": "0"}, 800);
        angular.element(".mysoreInside").delay(4000).animate({"opacity": "1"}, 800);
      }
      $scope.animatePackages4();
       $scope.repeat = setInterval($scope.animatePackages4, 4000);

       $scope.animateSideBanner = function(){
        angular.element(".sidebanner2, .sidebanner22").delay(5000).animate({"opacity": "1"}, 800);
        angular.element(".sidebanner1, .sidebanner11").delay(5000).animate({"opacity": "0"}, 800);
        
        angular.element(".sidebanner2, .sidebanner22").delay(5000).animate({"opacity": "0"}, 800);
        angular.element(".sidebanner1, .sidebanner11").delay(5000).animate({"opacity": "1"}, 800);
      }
      $scope.animateSideBanner();
       $scope.repeat = setInterval($scope.animateSideBanner, 5000);

       angular.element("#datepicker1, #datepicker2" ).datepicker({ minDate: 0});

        angular.element(".oneWay").click(function(){
          angular.element(".returnDate").prop("disabled", true);
          angular.element(".returnTime").prop("disabled", true);
        });

        angular.element(".roundTrip").click(function(){
          angular.element(".returnDate, .returnTime").prop("disabled", false);
        });
       angular.element(".airportDrop").click(function(){
          angular.element(".dropDetails").css("right","0px");
        });
        
        angular.element(".dropSubmit, .cancel").click(function(){
          angular.element(".dropDetails").css("right","-300px");
        });
        angular.element(".dropdownMain").click(function(){
          angular.element(".dropdown").css({"display":"block"});
        });
        angular.element(document).click(function(){
          angular.element(".dropdown").css({"display":"none"});
        });
        angular.element(".dropdownMain").click(function(e){
          e.stopPropagation();
          return false;
        })
        

        
   };

   
   //Calling the load function
   $scope.load();


});
