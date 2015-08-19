/* reqiure deps*/
var angular = require('angular'),
    {JobTime, TimeValidator} = require('./jobtime'),
    register = require('./utils/register');

/* require modules */
var animate = require('angular-animate'),
    aria = require('angular-aria'),
    material = require('angular-material'),
    translate = require('angular-translate');

/* define app & components */
var App = angular.module('App', [animate, aria, material, translate]);
register('App').directive('jobTime', JobTime);
register('App').directive('validtime', TimeValidator);

App.controller('IndexCtrl', ["$scope", ($scope) => {
  $scope.days = {
    everyday: { start: "09.00", end: "17.00" },
  }
  $scope.errors = [];
}]);

App.config(['$translateProvider', ($translateProvider) => {
  var i18n = {
    en: { COMPANY: { JOBTIME: {
      HEADER: "Work Time",
      SUBHEADER: "Time & Days of work",

      AROUNDTHECLOCK: "around the clock",
      EVERYDAY: "everyday",
      WORKDAY: "workday",
      WEEKEND: "weekend",

      MONDAY: "monday",
      TUESDAY: "tuesday",
      WEDNESDAY: "wednesday",
      THURSDAY: "thursday",
      FRIDAY: "friday",
      SATURDAY: "saturday",
      SUNDAY: "sunday",

      UNNAMED: "unnamed",

      TIME: {
        START: "Start time",
        END: "End time"
      },

      ADD: "+ Add More",
      SAVE: "Save"
    }}}
  }

  $translateProvider
    .translations('en', i18n.en)
    .preferredLanguage('en');
}]);

/* bootstrap app*/
angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['App']);
});
