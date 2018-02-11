var App = angular.module('codecraft', [
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toaster',
    'ngAnimate',
    'ui.router'
]);

// Defining routes
// You can use more ten one App.config so this one is dedicated to ui-router
// injected $stateProvider and $urlRouterProvider which are from ui-router package
App.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        // you define a state by giving a name (list) ) and providing object literal with configuration
        // which tells the router what to do
        // list state is associacieted with url: "/"
        // when you hit that url which template does it need to load and which controller

        // index.html/#/
        .state('list', {
            url: "/",
            templateUrl: 'templates/list.html',
            controller: 'PersonListController'
        })
        // index.html/#/edit/eloy@felix.info
        .state('edit', {
            url: "/edit/:email",
            templateUrl: 'templates/edit.html',
            controller: 'PersonDetailController'
        });

    $urlRouterProvider.otherwise('/');
});

// setup http service to get to api resource
App.config(function ($httpProvider, $resourceProvider, laddaProvider,$datepickerProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = 'Token 826b1873000ab4c4c4c85327408f89aab9b9bd7c';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    laddaProvider.setOption({
        style: 'expand-right'
    });
    angular.extend($datepickerProvider.defaults, {
        dateFormat: 'd/M/yyyy',
        autoclose: true
    });
});

// inject factory Contact to Service we created
// angular is calling Contact factory automatically just like is called config above and controller
// you don't need to call it yourself - angular does it
App.factory("Contact", function ($resource) {
    // this factory is the whole code do get delete update and post save,
    // use that Contact factory in the service it self in updateContract method

    // return $resource("https://api.codecraft.tv/samples/v1/contact/:id/");
    // to be able to save update data to api you need to update above  $resource which is commented out now
    // updated is bellow
    return $resource("https://api.codecraft.tv/samples/v1/contact/:id/", {id: '@id'}, {
        update: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE'
        }
    });
    // {id:'@id'} this is parameter map, if it finds an id in the resource, use that id as a parameter
    // {update: {method:'PUT'} } this is second parameter when we call an update() function on a Contact resource use a method PUT

});

// custom filter name 'defaultImage'
App.filter('defaultImage', function () {

    // need to return another function with 2 parameters input and param
    return function (input, param) {
        if(! input) {
            return param;
        }
        return input;
    }
});

// inject ContactService pass service $modal for angular strip  showCreateModal
App.controller('PersonListController', function ($scope, $modal, ContactService) {
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
        if (angular.isDefined(newVal)) {
            $scope.contacts.doSearch(newVal);
        }
    });

    // watch on order
    $scope.$watch('order', function (newVal, oldVal) {
        console.log(newVal);
        if (angular.isDefined(newVal)) {
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

    // to use agular strapp moddal you need to inject to PersonListController a service that angular strap provides
    $scope.showCreateModal = function () {

        $scope.contacts.selectedPerson = {}; // null select person
        // assing $modal service with set of parameters to variable createModal
        $scope.createModal = $modal({
            // parameter one scope
            scope: $scope,
            // parameter two template
            template: 'templates/modal.create.tpl.html',
            // parameter three show
            show: true
        })
    };

    $scope.createContact = function () {
        console.log('createContact');

        $scope.contacts.createContact($scope.contacts.selectedPerson)
        // no 5. since 1 to 4 service CreateContact is returning a promise we can just type .then
            .then(function () {
                $scope.createModal.hide(); // hide is a internal function of modal
            });
        // how this contain a data from form?
        // $scope.contacts.selectedPerson is binded to from fields ng-model="contacts.selectedPerson.name" ng-model="contacts.selectedPerson.email"
        // so once you set this inside the form you have bind this to ng-model and it is in $scope.contacts.selectedPerson
        // no magic
        // $scope.contacts.createContact, createContact is a variable which points to function  - have a look at ContactService at the bootom

        // once creation is complete we want a callback which we can hook into in our createContact controller function
        // and when it is complete we will then hide CreateModal
        // to achieve this we have to inject $q to ContactService  which will allow us to create promises
    };

});

App.controller('PersonDetailController', function ($scope, $stateParams, $state, ContactService) { // inject ContactService

    // pass parameters defined in ui router url: "/edit/:email",
    // :email is a $stateParams
    console.log($stateParams);

    $scope.contacts = ContactService;
    // call getPerson to get it and load under $scope.contacts.selectedPerson so edit.html template can use it
    $scope.contacts.selectedPerson = $scope.contacts.getPerson($stateParams.email);


    // to save form call button save and call event save
    $scope.save = function () {

        // since we want everything to happen on the service ContactService we will create updateContact method on
        // on the service ContactService
        // add this method to ContactService
        // pass selected person to updateContact() on service ContactService
        $scope.contacts.updateContact($scope.contacts.selectedPerson).then(function () {
            // once saved go to 'list' view
            $state.go("list");
        });
    };

    /// event remove is called from button Delete on form
    $scope.remove = function () {
        $scope.contacts.removeContact($scope.contacts.selectedPerson).then(function () {
            // once saved go to 'list' view
            $state.go("list");
        });
    }

});

// this is service. Service returns object with data it needs to be at the top of this file otherwhise problem.
// ContactService returns object with data
App.service('ContactService', function (Contact, $q, toaster) {
    var self = {
        'page': 1, // pagination page 1
        'hasMoreData': true, // has more data to display
        'isLoading': false, // currently loading page = false
        'selectedPerson': null,
        'persons': [],
        'search': null,
        'order': null,
        // getPerson by (email) which will be used in edit.html form to display person data to edit
        'getPerson': function (email) {
            console.log(email);
            // loop through all persons array
            // by the way loadContacts bellow is loading all contacts to person array
            for (var i = 0; i < self.persons.length; i++) {
                var person = self.persons[i];
                // if you have a match on email return that person
                if (person.email === email) {
                    return person;
                }
            }
        },
        'doSearch': function (search) {
            // reset to staring point as we are making search
            self.hasMoreData = true;
            self.page = 1;
            self.persons = [];
            self.search = search; // store search on object , will be used in LoadContacts in params
            self.loadContacts(); // call loadContacts() and that function has params and there is search query parameter
        },
        'doOrder': function (order) {
            // reset to staring point as we are making search
            self.hasMoreData = true;
            self.page = 1;
            self.persons = [];
            self.ordering = order; // store order on object , will be used in LoadContacts in params
            self.loadContacts(); // call loadContacts() and that function has params and there is order query parameter
        },
        'loadContacts': function () {
            // make a call to get data only
            // load more will be called houndred times but API needs to be called only once if there is
            // hasMoreData set to true and we are not already calling API
            if (self.hasMoreData && !self.isLoading) { // defensive code to not allow to call API non stop

                self.isLoading = true; // is calling API now

                var params = {
                    'page': self.page,
                    'search': self.search, // api requires param called search
                    'ordering': self.ordering // api requires param called ordering
                };
                // anythig send to get() as first parameter will be attached at the end of url as query parameters
                // and we want to send a page of data that we want to request
                Contact.get(params, function (data) { // Contact.get() get is in API most likely
                    console.log(data);
                    // loop through data.results and push it to persons array
                    angular.forEach(data.results, function (person) {

                        // loads all contacts to array persons
                        self.persons.push(new Contact(person));
                    });

                    // if we don't have next parameter we don't have any data to display
                    if (!data.next) {
                        self.hasMoreData = false;
                    }

                    self.isLoading = false; // called to API was performed so you can call it again
                });
            }
        },
        'loadMoreData': function () {
            if (self.hasMoreData && !self.isLoading) {
                self.page += 1;
                self.loadContacts();
            }
        },
        'updateContact': function (person) {
            console.log('Service Called Update selected person');
            console.log(person);
            // use Contact.update()  it is defined here {update: {method:'PUT'} }on resource
            // self.isSaving = true; // start spinning button
            // Contact.update(person).$promise.then(function () {
            //     // for ladda button to finish spinning whne promise is completed (when update is done)
            //     self.isSaving = false; // you need to put isSaving to template/form.html <button ladda="contacts.isSaving">Save</button >
            // });

            // the other way to update person is like that
            // becouse when we where creating self.persons.push(new Contact(person)); on Contact.get() we created new Contact so we have
            // person tougether with all the methodes attached to it e.g update and you are using it like that person.$update().then(...)
            // no promise
            var d = $q.defer();
            self.isSaving = true;
            person.$update().then(function () {
                self.isSaving = false; // you need to put isSaving to template/form.html <button ladda="contacts.isSaving">Save</button >
                toaster.pop('success', 'Updated ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        'removeContact': function (person) {

            console.log('Service Called delete selected person');
            console.log(person);

            // create defer object for promise
            // 1. when somone calls createContract
            var d = $q.defer();
            self.isDeleting = true;
            // this will send http delete message to apropriate API end point
            person.$remove().then(function () {
                self.isDeleting = false; // you need to put isSaving to template/form.html <button ladda="contacts.isDeleting">Delete</button >
                // get index of selected person to be able to remove it from array
                var index = self.persons.indexOf(person);
                // remove element from object of position index and remove 1
                self.persons.splice(index, 1); // position and how many to delete
                // Angular will automatically detect the change to the persons array and do the update of ng-repeat

                // also you need to remove it from right Person Details Panel
                self.selectedPerson = null; // null out to remove it from the view
                toaster.pop('success', 'Deleted ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        // here is that ContactService variable, property on that object which calls factory save method on App.factory("Contact")
        'createContact': function (person) {
            // create defer object for promise
            // 1. when somone calls createContract
            var d = $q.defer();

            self.isSaving = true;
            // 2. this will happen asynchronously
            Contact.save(person).$promise.then(function () {
                self.isSaving = false;
                self.selectedPerson = null; // null out selected person
                self.hasMoreData = true;
                self.page = 1;
                self.persons = []; // reset persons to blank
                self.loadContacts(); // and call loadContacts()
                toaster.pop('success', 'Created ' + person.name);
                // 4. then from here once Contact.save is done we call
                d.resolve(); // and how we consume this in the controller is simple - go to $scope createContact (look for no 5)
            });

            // 3. and imadietally will return a promise
            return d.promise;
        }

    };

    self.loadContacts();
    return self;

});