"use strict";

var _temporalUndefined = {};

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/* main directive class */
var JobTime = _temporalUndefined;

/* Directive for validate time format */
var TimeValidator = _temporalUndefined;

function _temporalAssertDefined(val, name, undef) { if (val === undef) { throw new ReferenceError(name + " is not defined - temporal dead zone"); } return true; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.prototype.renameKey = function (Old, New) {
  if (Old == New) return this;

  if (this.hasOwnProperty(Old)) {
    this[New] = this[Old];
    delete this[Old];
  }
  return this;
};

/* valid function for valid time string format */
/* 24 hours format */
function validTime(time) {
  var time = time.split('.');
  return time[0] >= 0 && time[0] < 24 && (time[1] >= 0 && time[1] < 60);
}
JobTime = (function () {
  function JobTime() {
    _classCallCheck(this, _temporalAssertDefined(JobTime, "JobTime", _temporalUndefined) && JobTime);

    this.templateUrl = "partials/jobtime.html";
    this.$scope = { days: "=", errors: "=" };
    this.restrict = "E";

    this.workday = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    this.weekend = ["saturday", "sunday"];

    this.mixins = ["everyday", "workday", "weekend"];
    this.week = this.workday.concat(this.weekend);
  }

  _createClass(_temporalAssertDefined(JobTime, "JobTime", _temporalUndefined) && JobTime, [{
    key: "link",
    value: function link($scope, $element, $attrs) {
      /* link scope in global instance */
      this.$scope = $scope;

      /* init scope values */
      $scope.tags = { everyday: false, around: false };
      $scope.errors = [];
      $scope.week = {};

      /* bind utils after mount */
      this.DayProxy = this.DayProxy.bind(null, $scope);
      this.tagsIsToggle = this.tagsIsToggle.bind(this);
      this.setLocalWeek = this.setLocalWeek.bind(this);
      this.onWeekUpdate = this.onWeekUpdate.bind(this);
      this.removeDay = this.removeDay.bind(this);
      this.allowed = this.allowed.bind(this);
      this.newDay = this.newDay.bind(this);
      this.save = this.save.bind(this);

      /* scope helpers */
      $scope.newDay = this.newDay.bind(this, null, true);
      $scope.remove = this.removeDay;
      $scope.allowed = this.allowed;
      $scope.save = this.save;

      /* watch tags on changes */
      $scope.$watch('tags', this.tagsIsToggle, true);
      $scope.$watch('week', this.onWeekUpdate, true);

      /* create local week store*/
      this.setLocalWeek();
    }
  }, {
    key: "onWeekUpdate",
    value: function onWeekUpdate() {
      var $scope = this.$scope,
          week = $scope.week,
          self = this;

      if (week.everyday) $scope.tags.everyday = true;
      if (week.workday) this.workday.forEach(function (day) {
        if (week[day]) self.removeDay(day);
      });
      if (week.weekend) this.weekend.forEach(function (day) {
        if (week[day]) self.removeDay(day);
      });
    }
  }, {
    key: "allowed",
    value: function allowed(defaults) {
      var $scope = this.$scope,
          allowed = [];
      function verify(week) {
        week.forEach(function (day, index) {
          if (!$scope.week[day]) allowed.push(day);
        });
      }

      if (!$scope.tags.everyday) {
        if (!$scope.week.everyday) allowed.push("everyday");
        if (!$scope.week.workday) {
          allowed.push("workday");verify(this.workday);
        };
        if (!$scope.week.weekend) {
          allowed.push("weekend");verify(this.weekend);
        };
      }

      return allowed;
    }
  }, {
    key: "tagsIsToggle",
    value: function tagsIsToggle(values, old) {
      var $scope = this.$scope;
      var around = values.around;
      var everyday = values.everyday;

      /* enable from changes */

      if (around && around != old.around) {
        for (var day in $scope.week) {
          angular.extend($scope.week[day], {
            start: "00.00", end: "24.00"
          });
        }
      }

      if (everyday && everyday != old.everyday) {
        /* clear local store*/
        $scope.week = {};
        /* add new everyday record */
        this.newDay({ key: "everyday", start: "09.00", end: "17.00" }, true, "everyday");
      }

      /* clean week if everyday disable */
      if (!everyday && everyday != old.everyday) this.removeDay('everyday');
    }

    /* local week schema */
  }, {
    key: "setLocalWeek",
    value: function setLocalWeek() {
      var _this = this;

      var $scope = this.$scope,
          store = $scope.days,
          self = this;
      this.week.concat(this.mixins).forEach(function (day, i) {
        var $day = store[day]; /* day data from global store */
        /* set value for local store in instance*/
        if ($day) {
          var start = $day.start;
          var end = $day.end;
          /* get values */
          /* set object value as Proxy */
          $scope.week[day] = _this.newDay({
            start: _temporalAssertDefined(start, "start", _temporalUndefined) && start, end: _temporalAssertDefined(end, "end", _temporalUndefined) && end, key: day
          }, false);
        }
      });
    }

    /* create day object with handler - and add to store or return */
  }, {
    key: "newDay",
    value: function newDay(day, add, flag) {
      var $scope = this.$scope,
          week = $scope.week;

      var data = { start: "09.00", end: "17.00", key: "unnamed" };
      /* if set new value - call handler*/
      var $day = new this.DayProxy(add ? flag ? day : data : day);
      /* if flag add is active add to local week store */
      if (add) {
        flag = flag ? flag : "unnamed";
        if (!week.unnamed) week[flag] = $day;else $scope.errors.push("blank field");
      }
      /* else return proxy object */
      else return $day;
    }

    /* remove exists day from local store */
  }, {
    key: "removeDay",
    value: function removeDay(key) {
      var $scope = this.$scope;
      if (key == "everyday") $scope.tags.everyday = false;
      /* WTF, if after remove object size is 0, view not updated */
      delete $scope.week[key];

      var keys = Object.keys($scope.week);

      /* crutch again in view of the life cycle */
      if (keys.length == 1) {
        for (var m = 0; m < this.mixins.length; m++) {
          var mixin = _temporalUndefined;
          mixin = this.mixins[m];
          if (keys[0] == (_temporalAssertDefined(mixin, "mixin", _temporalUndefined) && mixin)) {
            this.newDay(null, true);break;
          }
        }
      }

      /* Bug life cycle - view does not update when the last element.
         Crutch - Add an empty element if all removed.
      */
      if (keys.length == 0) this.newDay(null, true);
    }

    /* proxy hanler if change values */
  }, {
    key: "DayProxy",
    value: function DayProxy($scope, day) {
      this.start = day.start;this.end = day.end;
      var key = day.key;

      /* emulate proxy for watch key prop & update key in week*/
      Object.defineProperty(this, "key", {
        get: function get() {
          return key;
        },
        set: function set(value) {
          var oldkey = key;
          key = value;
          $scope.week.renameKey(oldkey, value);
        }
      });
    }

    /* save data in global binding */
  }, {
    key: "save",
    value: function save() {
      var $scope = this.$scope,
          errors = $scope.errors = [];
      // Clear
      $scope.days = {};
      /* verify days in week - and add to store if valid */
      for (var day in $scope.week) {
        var $day = _temporalUndefined; /* get day */
        $day = $scope.week[day];
        var start = (_temporalAssertDefined($day, "$day", _temporalUndefined) && $day).start;
        var end = (_temporalAssertDefined($day, "$day", _temporalUndefined) && $day).end;
        var key = (_temporalAssertDefined($day, "$day", _temporalUndefined) && $day).key;
        /* get values */
        /* set new value in global store */
        if (start && end && key != "unnamed" && typeof (_temporalAssertDefined($day, "$day", _temporalUndefined) && $day) != 'function') {
          var $start = _temporalUndefined,
              $end = _temporalUndefined;
          $start = start.split('.');
          $end = end.split('.');
          if (start[0] < end[0]) $scope.days[day] = { start: start, end: end };else errors.push(day + " - start time gretter than end time");
        }
        /* add errors if not values */
        else {
            /* It is also involved in the iteration function prototype renameKey - if it comes - ignore. */
            if (typeof (_temporalAssertDefined($day, "$day", _temporalUndefined) && $day) != 'function') errors.push(key);
          };
      }
    }
  }]);

  return _temporalAssertDefined(JobTime, "JobTime", _temporalUndefined) && JobTime;
})();

TimeValidator = (function () {
  function TimeValidator() {
    _classCallCheck(this, _temporalAssertDefined(TimeValidator, "TimeValidator", _temporalUndefined) && TimeValidator);

    this.require = "ngModel";
  }

  _createClass(_temporalAssertDefined(TimeValidator, "TimeValidator", _temporalUndefined) && TimeValidator, [{
    key: "link",
    value: function link($scope, $element, $attrs, ctrl) {
      ctrl.$validators.validtime = function (model, view) {
        /* valid with target function */
        return validTime(view);
      };
    }
  }]);

  return _temporalAssertDefined(TimeValidator, "TimeValidator", _temporalUndefined) && TimeValidator;
})();

if (typeof exports != "undefined") {
  module.exports = { TimeValidator: _temporalAssertDefined(TimeValidator, "TimeValidator", _temporalUndefined) && TimeValidator, JobTime: _temporalAssertDefined(JobTime, "JobTime", _temporalUndefined) && JobTime };
} else {
  angular.module('jobtime', ['ngMaterial', 'pascalprecht.translate']);
  register('jobtime').directive('jobTime', _temporalAssertDefined(JobTime, "JobTime", _temporalUndefined) && JobTime);
  register('jobtime').directive('validtime', _temporalAssertDefined(TimeValidator, "TimeValidator", _temporalUndefined) && TimeValidator);
}