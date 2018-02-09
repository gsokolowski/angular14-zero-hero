var App = angular.module('codecraft', [
    'ngResource',
    'infinite-scroll'
]);

// setup http service to get to api resource
App.config(function ($httpProvider, $resourceProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = 'Token 826b1873000ab4c4c4c85327408f89aab9b9bd7c';
    $resourceProvider.defaults.stripTrailingSlashes = false;
});

// inject factory Contact to Service we created
App.factory("Contact", function ($resource) {
    return $resource("https://api.codecraft.tv/samples/v1/contact/:id/")
});

App.controller('PersonDetailController', function ($scope, ContactService) { // inject ContactService

    $scope.contacts = ContactService;
    $scope.selectedPersons = ContactService.selectedPerson;

});

App.controller('PersonListController', function ($scope, ContactService) { // inject ContactService
    // $scope is special variable
    // anything we add to $scope variable we can data bind to HTML

    // so lets add to scope object:
    // persons
    $scope.search = ""; // not an object but string
    $scope.order = 'email'; // order needs to be in scope

    $scope.contacts = ContactService;
    $scope.contacts.showPanel = false; // this could be added to service as a default element for start don't display panel
    $scope.selectedPersons = ContactService.selectedPerson;

    // loadMore for pagination
    $scope.loadMore = function () {
        console.log('loadMore');
    };
    // when upi clock on row selectPerson(index, person)  will be called and you pass index and person
    $scope.selectPerson = function (person) {
        $scope.contacts.selectedPerson = person; // get access to selected person details to display inside Details Panel on the right
        $scope.contacts.showPanel = true;
    };

    // https://www.udemy.com/angularjs-from-zero-to-hero/learn/v4/t/lecture/3203264?start=0
    $scope.sensitiveSearch = function(person) {

        // if something is entered into search
        // this will be called in ng-repeat
        if ($scope.contacts.search) {

            // show this person name or email is there is a match or don't show it if there is not a match
            // All case sensitive
            // it is called on every element (nr-repeat) in
            return person.name.indexOf($scope.contacts.search) == 0 || person.email.indexOf($scope.contacts.search) == 0;
        }
        // show full list
        return true;
    };
});

// this is service. Service returns object with data it needs to be at the top of this file otherwhise problem.
// ContactService returns object with data
App.service('ContactService', function (Contact) {

    // https://www.udemy.com/angularjs-from-zero-to-hero/learn/v4/t/lecture/6145402?start=0
    var self =  {
        'addPerson': function (person) {
            this.persons.push(person); // add new person to persons array
        },
        'page' : 1, // pagination page 1
        'hasMoreData' : true, // has more data to display
        'isLoading' : false, // currently loading page = false
        'selectedPerson': null,
        'persons' : [],
        'loadContacts' : function () {

            // make a call to get data only
            Contact.get(function (data) {
                console.log(data);
                // loop through data.results and push it to persons array
                angular.forEach(data.results, function (person) {
                    self.persons.push(person);
                });
            });
        }

    };

    self.loadContacts(); // calling function loadContacts on object self. self.loadContacts()

    return self;
});