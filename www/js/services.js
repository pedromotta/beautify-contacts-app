(function() {
  'use strict';

  angular
    .module('app.services', [])
    .factory('contactsService', contactsService)
    .factory('libPhoneNumberService', libPhoneNumberService);

  contactsService.$inject = ['$q', '$cordovaContacts'];

  function contactsService($q, $cordovaContacts) {
    var isMobile = ionic.Platform.isWebView();
    var cachedContacts = !isMobile ? [{
      id: '23',
      displayName: 'teste',
      phoneNumbers: [{
        value: '(031) 99744-5443'
      }, {
        value: '+61 420 287 998'
      }, {
        value: '+5531997243554'
      }, {
        value: '31997243554'
      }, {
        value: '031999787121'
      }, {
        value: '999787121'
      }]
    }] : [];
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
          console.log('cache: ' + cachedContacts.length);
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

    function formatPhoneNumber(phoneNumber, prefix) {
      var formattedPhoneNumber = '';
      var sPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
      var isInternational = isInternationPhone(sPhoneNumber);

      if (!isInternational) {
        if (sPhoneNumber.length === 8 || sPhoneNumber.length === 9) {
          sPhoneNumber = '31'.concat(sPhoneNumber);
        }
      }

      formattedPhoneNumber = sPhoneNumber;
      return formattedPhoneNumber;
    }

    function isInternationPhone(phoneNumber) {
      return phoneNumber.startsWith('+') &&
             !phoneNumber.startsWith('+55');
    }

    function isValidPhoneNumber(phoneNumber, region) {
      var international = phoneNumber.startsWith('+');
      var phoneObject = instanceUtil.parseAndKeepRawInput(phoneNumber, region);

      if (international) {
        return instanceUtil.isValidNumber(phoneObject);
      } else {
        return instanceUtil.isValidNumberForRegion(phoneObject, region);
      }
    }

    function format(phoneNumber, region) {
      region = region || 'BR';
      var newPhoneNumber = formatPhoneNumber(phoneNumber);
      var isInternational = isInternationPhone(newPhoneNumber);
      var isValid = isValidPhoneNumber(newPhoneNumber, region);
      var formattedPhone = '';

      if (!isValid) {
        return phoneNumber;
      } else {
        var phoneObject = instanceUtil.parseAndKeepRawInput(newPhoneNumber, region);

        if (!isInternational) {
          formattedPhone = phoneObject.getNationalNumber();
        } else {
          formattedPhone = instanceUtil.format(phoneObject, libphonenumber.PhoneNumberFormat.E164);
        }
      }

      return formattedPhone;
    }
  }

})();
