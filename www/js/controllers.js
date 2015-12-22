(function() {
  'use strict';

  angular.module('app.controllers', [])
    .controller('DashController', DashController)
    .controller('ContactsController', ContactsController)
    .controller('ContactDetailController', ContactDetailController)
    .controller('ConfigsController', ConfigsController);

  DashController.$inject = ['contactsService', '$ionicLoading'];
  ContactsController.$inject = ['contactsService'];
  ContactDetailController.$inject = ['$stateParams', 'contactsService', 'libPhoneNumberService'];

  function logger(scope, text) {
    scope.logs = scope.log || '';
    console.log(text);
    scope.logs += '</br> ' + text;
  }

  function DashController(contactsService, $ionicLoading) {
    var vm = this;

    $ionicLoading.show({
      template: 'Loading...'
    });

    $ionicLoading.hide();
    logger(vm, 'Buscando contatos...' + !!navigator.contacts);
    contactsService.getAll().then(function(contacts) {
      vm.contacts = contacts || [];
      //logger(vm, 'Contatos: ' + JSON.stringify(contacts));
    }, function(err) {
      logger(vm, 'Erro ao buscar contatos: ' + err);
    });
  }

  function ContactsController(contactsService) {
    var vm = this;
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    contactsService.getAll()
      .then(function(contacts) {
        vm.contacts = contacts;
      });

    // $scope.remove = function(chat) {
    //   Chats.remove(chat);
    // };
  }

  function ContactDetailController($stateParams, contactsService, libPhoneNumberService) {
    var vm = this;

    vm.format = function(phone) {
      return libPhoneNumberService.format(phone, 'BR');
    };

    var id = $stateParams.contactId;
    contactsService.getById(id)
      .then(function(data) {
        console.log(JSON.stringify(data));
        vm.contact = data;
      });
  }

  function ConfigsController() {
    var vm = this;
    vm.settings = {
      enableFriends: true
    };
  }

})();
