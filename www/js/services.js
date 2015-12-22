(function() {
  'use strict';

  angular
    .module('app.services', [])
    .factory('contactsService', contactsService)
    .factory('libPhoneNumberService', libPhoneNumberService);

  contactsService.$inject = ['$q', '$cordovaContacts'];

  function contactsService($q, $cordovaContacts) {
    var isMobile = ionic.Platform.isWebView();
    var cachedContacts = !isMobile ? [{id:'23', displayName:'teste', phoneNumbers: [{value: '(031) 99744-5443'},{value: '+61 420 287 998'}]}] : [];
    var loaded = !isMobile;
    var service = {
      getAll: getAll,
      getById: getById
    };

    getContacts();

    return service;

    function getContacts() {
      var deferred = $q.defer();

      var options = {};
      options.find = '';
      options.multiple = true;
      options.hasPhoneNumber = true;

      if (!loaded) {
        $cordovaContacts.find(options).then(function(contacts) {
          loaded = true;
          cachedContacts = contacts.filter(function(elem) {
            return elem.phoneNumbers;
          });
          console.log('cache: '+ cachedContacts.length);
          deferred.resolve(cachedContacts);
        }, deferred.reject);
      } else {
        deferred.resolve(cachedContacts);
      }

      return deferred.promise;
    }

    function getAll() {
      var deferred = $q.defer();

      getContacts().then(deferred.resolve, deferred.reject);

      return deferred.promise;
    }

    function getById(id) {
      var deferred = $q.defer();

      getContacts().then(function(contacts) {
        var contact = contacts.find(function(elem) {
          return elem.id === id;
        });
        deferred.resolve(contact);
      }, deferred.reject);

      return deferred.promise;
    }
  }

  function libPhoneNumberService() {
    var instanceUtil = libphonenumber.PhoneNumberUtil.getInstance();

    var services = {
      format: format
    };

    return services;

    function format(phoneNumber, region) {
      region = region || 'BR';
      var phoneObject = instanceUtil.parseAndKeepRawInput(phoneNumber, region);

      var numberFormat = instanceUtil.isValidNumberForRegion(phoneObject, region) ?
                          libphonenumber.PhoneNumberFormat.NATIONAL :
                          libphonenumber.PhoneNumberFormat.E164;

      var formattedPhone = '';

      if (numberFormat === libphonenumber.PhoneNumberFormat.NATIONAL) {
        formattedPhone = phoneObject.getNationalNumber();
      } else {
        formattedPhone = instanceUtil.format(phoneObject, numberFormat);
      }

      return formattedPhone;
    }
  }

})();
