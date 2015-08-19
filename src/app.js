/* reqiure deps*/
var angular = require('angular'),
    {JobTime, TimeValidator} = require('./jobtime'),
    register = require('./utils/register');

/* require modules */
var animate = require('angular-animate'),
    aria = require('angular-aria'),
    material = require('angular-material');

/* define app & components */
var App = angular.module('App', [animate, aria, material]);
register('App').directive('jobTime', JobTime);
register('App').directive('validtime', TimeValidator);

App.controller('IndexCtrl', ["$scope", ($scope) => {
  $scope.days = {
    everyday: { start: "09.00", end: "17.00" },
  }
  $scope.errors = [];
}]);

/* bootstrap app*/
angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['App']);
});
