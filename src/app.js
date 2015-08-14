/* reqiure deps*/
var angular = require('angular'),
    {JobTime, TimeValidator} = require('./jobtime'),
    register = require('./utils/register');

/* require modules */
require('angular-animate');
require('angular-aria');
require('angular-material');

/* define app & components */
var App = angular.module('App', ['ngMaterial']);
register('App').directive('jobTime', JobTime);
register('App').directive('validtime', TimeValidator);

App.controller('IndexCtrl', ["$scope", ($scope) => {
  $scope.days = [
    { start: "09.30", end: "17.30", day: "monday" },
    { start: "10.30", end: "18.30", day: "sunday" }
  ];
}]);

/* bootstrap app*/
angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['App']);
});
