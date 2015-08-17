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
  return (
    (time[0] >= 0 && time[0] < 24) && (time[1] >= 0 && time[1] < 60)
  );
}

/* main directive class */
class JobTime {
  constructor() {
    this.templateUrl = "partials/jobtime.html";
    this.$scope = { days: "=" };
    this.restrict = "E";

    this.workday = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    this.weekend = ["saturday", "sunday"];

    this.mixins = ["everyday", "workday", "weekend"];
    this.week = this.workday.concat(this.weekend);
  }

  link($scope, $element, $attrs) {
    /* link scope in global instance */
    this.$scope = $scope;

    /* init scope values */
    $scope.tags = { everyday: false, around: false };
    $scope.errors = [];
    $scope.week = {};

    /* bind utils after mount */
    this.handlerProxyDay = this.handlerProxyDay.bind(this);
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

  onWeekUpdate() {
    var $scope = this.$scope, week = $scope.week, self = this;

    if (week.everyday) $scope.tags.everyday = true;
    if (week.workday) this.workday.forEach((day) => { if (week[day]) self.removeDay(day); });
    if (week.weekend) this.weekend.forEach((day) => { if (week[day]) self.removeDay(day); });
  }

  allowed(defaults) {
    var $scope = this.$scope, allowed = [];
    function verify(week) {
      week.forEach((day, index) => { if (!$scope.week[day]) allowed.push(day); });
    }

    if (!$scope.tags.everyday) {
      if (!$scope.week.everyday) allowed.push("everyday");
      if (!$scope.week.workday) { allowed.push("workday"); verify(this.workday); };
      if (!$scope.week.weekend) { allowed.push("weekend"); verify(this.weekend); };
    }

    return allowed;
  }

  tagsIsToggle(values, old) {
    var $scope = this.$scope;
    var {around, everyday} = values;
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
      this.newDay({key: "everyday", start: "09.00", end: "17.00"}, true, "everyday");
    }

    /* clean week if everyday disable */
    if (!everyday && everyday != old.everyday) this.removeDay('everyday');
  }

  /* local week schema */
  setLocalWeek() {
    var $scope = this.$scope, store = $scope.days, self = this;
    [this.workday, this.weekend].forEach((days, index) => {
      days.forEach((day, i) => {
        var $day = store[day]; /* day data from global store */
        /* set value for local store in instance*/
        if ($day) {
          let {start, end} = $day; /* get values */
          /* set object value as Proxy */
          $scope.week[day] = this.newDay({
            start: start, end: end, key: day
          }, false);
        }
      });
    });
  }

  /* create day object with handler - and add to store or return */
  newDay(day, add, flag) {
    var $scope = this.$scope, week = $scope.week;
    var data = { start: "09.00", end: "17.00", key: "unnamed" };
    /* if set new value - call handler*/
    var $day = new Proxy(add ? (flag ? day : data) : day, { set: this.handlerProxyDay });
    /* if flag add is active add to local week store */
    if (add) {
      flag = flag ? flag : "unnamed";
      if (!week.unnamed) week[flag] = $day;
      else $scope.errors.push("blank field");
    }
    /* else return proxy object */
    else return $day;
  }

  /* remove exists day from local store */
  removeDay(key) {
    var $scope = this.$scope;
    if (key == "everyday") $scope.tags.everyday = false;
    /* WTF, if after remove object size is 0, view not updated */
    delete $scope.week[key];

    var keys = Object.keys($scope.week);

    /* crutch again in view of the life cycle */
    if (keys.length == 1) {
      for (var m = 0; m < this.mixins.length; m++) { let mixin = this.mixins[m];
        if (keys[0] == mixin) { this.newDay(null, true); break; }
      }
    }

    /* Bug life cycle - view does not update when the last element.
       Crutch - Add an empty element if all removed.
    */
    if (keys.length == 0) this.newDay(null, true);

  }

  /* proxy hanler if change values */
  handlerProxyDay(target, name, value) {
    var $scope = this.$scope, oldname = target[name];
    if (name == "key") {
      /* set new key value */
      target[name] = value;
      /* update object key name in week scope object */
      $scope.week.renameKey(oldname, target[name]);
    } else {
      target[name] = value;
    }

    /* complete success */
    return true;
  }

  /* save data in global binding */
  save() {
    var $scope = this.$scope, errors = $scope.errors = [];
    // Clear
    $scope.days = {};
    /* verify days in week - and add to store if valid */
    for (var day in $scope.week) {
      let $day = $scope.week[day]; /* get day */
      var {start, end, key} = $day; /* get values */
      /* set new value in global store */
      if (start && end && key != "unnamed" && typeof($day) != 'function') {
        let $start = start.split('.'), $end = end.split('.');
        if ((start[0] < end[0])) $scope.days[day] = { start: start, end: end };
        else errors.push(`${day} - start time gretter than end time`);
      }
      /* add errors if not values */
      else {
        /* It is also involved in the iteration function prototype renameKey - if it comes - ignore. */
        if (typeof($day) != 'function') errors.push(key)
      };
    }
  }
}

/* Directive for validate time format */
class TimeValidator {
  constructor() {
    this.require = "ngModel";
  }

  link($scope, $element, $attrs, ctrl) {
    ctrl.$validators.validtime = (model, view) => {
      /* valid with target function */
      return validTime(view);
    };
  }
}

export {JobTime, TimeValidator};
