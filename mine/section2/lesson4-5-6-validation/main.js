
var App = angular.module('minmaxmodle', []);

App.controller('MinMaxCtrl', function ($scope, $http) {
    // $scope is special variable
    // anything we add to $scope variable we can data bind to HTML

    // so lets add to scope formModel object
    // object
    $scope.formModel = {};

    // or functions need to be attached to scope if you intend to use them in HTML
    $scope.onSubmit = function (isValid) {

        if(isValid) {
            console.log("Hey I'm submitted");
            console.log($scope.formModel);

            // post send data from your form ($scope.formModel) to you rest api
            $http.post('https://minmax-server.herokuapp.com/register/', $scope.formModel)
                .success(function (data) {
                    console.log('Post Success :)');
                }).error(function () {
                console.log('Error on Post :(');
            })
        } else {
            console.log('From is invalid');
        }
    };
});