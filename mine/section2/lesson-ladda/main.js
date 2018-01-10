
var App = angular.module('minmaxmodle', [
    'jcs-autoValidate',
    'angular-ladda'
]);


// this is middlewear - it runs before everyting else is called so you can hack into this some  form validarion messages
App.run(function (defaultErrorMessageResolver) {
        defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            errorMessages['tooYoung'] = 'You must be at least {0} years old to use this site';
            errorMessages['tooOld'] = 'You must be max {0} years old to use this site';
            errorMessages['badUsername'] = 'Username can only contain numbers and letters and _';
        });
    }
);

App.controller('MinMaxCtrl', function ($scope, $http) {
    // $scope is special variable
    // anything we add to $scope variable we can data bind to HTML

    // so lets add to scope formModel object
    // object
    $scope.formModel = {};
    $scope.laddaSubmitting = false;

    // or functions need to be attached to scope if you intend to use them in HTML
    $scope.onSubmit = function () {

        $scope.laddaSubmitting = true;
        console.log("Hey I'm submitted");
        console.log($scope.formModel);

        //post send data from your form ($scope.formModel) to you rest api
        $http.post('https://minmax-server.herokuapp.com/register/', $scope.formModel)
            .success(function (data) {
                $scope.laddaSubmitting = false;
                console.log('Post Success :)');
            }).error(function () {
            $scope.laddaSubmitting = false;
            console.log('Error on Post :(');
        })
    };
});