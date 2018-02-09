var App = angular.module('codecraft', [
    'ngResource',
    'infinite-scroll',
    'angularSpinner'
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
    // search and order are watched
    $scope.search = ""; // not an object but string
    $scope.order = 'email'; // order needs to be in scope

    // Watch search variable
    // when you will type something to search $watch will watch search variable and report new value
    $scope.$watch('search', function (newVal, oldVal) {
        console.log(newVal);
        if(angular.isDefined(newVal)) {
            $scope.contacts.doSearch(newVal);
        }
    });

    // watch on order
    $scope.$watch('order', function (newVal, oldVal) {
        console.log(newVal);
        if(angular.isDefined(newVal)) {
            $scope.contacts.doOrder(newVal);
        }
    });

    $scope.contacts = ContactService;
    $scope.contacts.showPanel = false; // this could be added to service as a default element for start don't display panel
    $scope.selectedPersons = ContactService.selectedPerson;

    // loadMore for pagination
    $scope.loadMore = function () {
        console.log('loadMore');
        $scope.contacts.loadMoreData();
    };



    // when upi clock on row selectPerson(index, person)  will be called and you pass index and person
    $scope.selectPerson = function (person) {
        $scope.contacts.selectedPerson = person; // get access to selected person details to display inside Details Panel on the right
        $scope.contacts.showPanel = true;
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
        'search' : null,
        'order' : null,
        'doSearch' : function (search) {
            // reset to staring point as we are making search
            self.hasMoreData = true;
            self.page = 1;
            self.persons = [];
            self.search  = search; // store search on object , will be used in LoadContacts in params
            self.loadContacts(); // call loadContacts() and that function has params and there is search query parameter
        },
        'doOrder' : function (order) {
            // reset to staring point as we are making search
            self.hasMoreData = true;
            self.page = 1;
            self.persons = [];
            self.ordering  = order; // store order on object , will be used in LoadContacts in params
            self.loadContacts(); // call loadContacts() and that function has params and there is order query parameter
        },
        'loadContacts' : function () {

            // make a call to get data only
            // load more will be called houndred times but API needs to be called only once if there is
            // hasMoreData set to true and we are not already calling API
            if(self.hasMoreData && ! self.isLoading) { // defensive code to not allow to call API non stop

                self.isLoading = true; // is calling API now

                var params = {
                    'page' : self.page,
                    'search' : self.search, // api requires param called search
                    'ordering' : self.ordering // api requires param called ordering
                };
                // anythig send to get() as first parameter will be attached at the end of url as query parameters
                // and we want to send a page of data that we want to request
                Contact.get(params, function (data) {
                    console.log(data);
                    // loop through data.results and push it to persons array
                    angular.forEach(data.results, function (person) {
                        self.persons.push(new Contact(person));
                    });

                    // if we don't have next parameter we don't have any data to display
                    if( ! data.next) {
                        self.hasMoreData = false;
                    }

                    self.isLoading = false; // called to API was performed so you can call it again
                });
            }
        },
        'loadMoreData': function () {
            if(self.hasMoreData && ! self.isLoading) {
                self.page +=1;
                self.loadContacts();
            }
        }

    };

    self.loadContacts();
    return self;

});