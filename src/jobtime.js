var angular = require('angular');

/* valid function for valid time string format */
/* 24 hours format */
function validTime(time) {
  var time = time.split('.');
  return ((time[0] >= 0 && time[0] < 24) && (time[1] >= 0 && time[1] < 60));
}

/* Class directive widget for manipulate job time. */
class JobTime {
  constructor() {
    /* days of week*/
    this.workday = [ "monday", "tuesday", "wednesday", "thursday", "friday" ];
    this.weekend = [ "saturday", "sunday" ];
    this.actions = [ "everyday", "workday", "weekend" ];
    this.week = this.workday.concat(this.weekend);

    /* default props this directive */
    this.templateUrl = "partials/jobtime.html";
    this.scope = { days: "=" };
    this.restrict = "E";
  }

  link($scope, $element, $attr) {
    /* scope to global */
    this.$scope = $scope;

    /* bind functions change data */
    this.allowedDays = this.allowedDays.bind(this);
    this.create = this.create.bind(this);
    this.remove = this.remove.bind(this);

    /* bind utils */
    this.toggle = this.toggle.bind(this);
    this.enableAround = this.enableAround.bind(this);
    this.enableWeek = this.enableWeek.bind(this);

    /* set helpers in scope*/
    $scope.toggle = this.toggle;
    $scope.remove = this.remove;
    $scope.create = this.create;

    /* days of week */
    $scope.week = this.week;

    /* tags for math*/
    $scope.tags = {
      around: false, /* around a clock - 24 hours */
      week: false /* everyday - 7/7 */
    };

    /* store to monitor changes and rebuild the permitted days */
    $scope.$watch('days', this.allowedDays, true);
    $scope.$watch('tags', this.toggle, true);
  }

  allowedDays () {
    var $scope = this.$scope, self = this;
    var allowed = angular.copy($scope.week).concat(this.actions);

    /* check for, and remove from the solution if there is */
    for (var i = 0; i < $scope.days.length; i++)
      allowed.splice(allowed.indexOf($scope.days[i].day), 1);

    /* block all if everyday */
    for (var i = 0; i < $scope.days.length; i++) { var day = $scope.days[i];
      if (day.day == "everyday") { $scope.days = [day]; break; }
    }

    /* clear workday for actions */
    for (var i = 0; i < $scope.days.length; i++) { var day = $scope.days[i].day;
      if (day == "workday") { $scope.days = this.clearDays($scope.days, this.workday, true); break; }
    }

    /* set to store */
    $scope.allowedDays = allowed;
  }

  clearDays(arr, values, full) {
    var target = []; for (var i = 0; i < arr.length; i++) {  var item = arr[i];
      if (values.indexOf(item.day) == -1) target.push(full ? item : item.day);
    }
    return target;
  }

  existsDay(days, names) {
    var exists = false;
    for (var i = 0; i < days.length; i++) {
      for (var ni = 0; ni < names.length; ni++) {
        if (days[i].day == names[ni]) {
          exists = true; break;
        }
      }
    }
    return exists;
  }

  create(time, flag) {
    var $scope = this.$scope, invalid = false;
    /* iterate & valid all days store*/
    for (var i = 0; i<$scope.days.length; i++) {
      var day = $scope.days[i];
      /* if item not valid - tag as invalid*/
      if (!this.validDay(day))
        invalid = true;
    };
    /* if all valid & not empty item - push new*/
    if (!invalid) $scope.days.push({
      start: time ? time.start : "09.00",
      end: time ? time.end : "17.00",
      day: flag ? flag : null
    });
  }

  validDay(day) {
    /* if day is null - invalid*/
    if (day.day == null) return false;
    /* if start or end time not match pattern - invalid */
    if (!validTime(day.start) || !validTime(day.end)) return false;
    return true;
  }

  /* remove target item */
  remove(day) {
    var $scope = this.$scope, i = $scope.days.indexOf(day);
    $scope.days.splice(i, 1);
  }

  toggle(values, old) {
    var $scope = this.$scope;
    var {around, week} = values;
    /* enable from changes */
    if (around && around != old.around) this.enableAround();
    if (week && week != old.week) this.enableWeek();
  }

  enableAround() {
    var $scope = this.$scope;
    for (var i = 0; i < $scope.days.length; i++) {
      /* after block input - set around the clock*/
      angular.extend($scope.days[i], {
        start: "00.00",
        end: "24.00"
      });
    }
  }

  enableWeek(time) {
    var $scope = this.$scope; $scope.days = [];
    this.create(time, "everyday");
  }
}

/* Directive for validate time format */
class TimeValidator {
  constructor() { this.require = "ngModel"; }

  link($scope, $element, $attrs, ctrl) {
    ctrl.$validators.validtime = (model, view) => {
      /* valid with target function */
      return validTime(view);
    };
  }
}

/* export classes as module */
module.exports = {
  TimeValidator: TimeValidator,
  JobTime: JobTime
};
