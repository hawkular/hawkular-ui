///
/// Copyright 2015-2016 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///    http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/// <reference path="../metricsPlugin.ts"/>
/// <reference path="../../../includes.ts"/>

module HawkularMetrics {

  export class HkAlertInfo {
    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      list: '=',
      limit: '=',
      resourceId: '=',
      title: '@'
    };
    public templateUrl = 'plugins/metrics/html/directives/alert-info.html';

    public static Factory() {
      let directive = () => {
        return new HkAlertInfo();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkAlertSummary {
    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      alert: '=hkAlert'
    };
    public templateUrl = 'plugins/metrics/html/directives/alert-summary.html';

    public static Factory() {
      let directive = () => {
        return new HkAlertSummary();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkAlertPanel {

    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      alert: '=hkAlert',
      refresh: '&hkRefresh',
      persona: '=hkPersona'
    };
    public templateUrl = 'plugins/metrics/html/directives/alert.html';

    constructor(private HawkularAlertsManager,
      private $location: ng.ILocationService) {
      this.link = (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        scope.showDetailPage = (alert: any): void => {
          let alertId = alert.alertId || alert.id;
          //let timeOffset = (alert.timeOffSet !== undefined)?alert.timeOffSet:3600000 * 12;
          //let endTime = alert.ctime;
          //this.$location.url(`/hawkular-ui/alerts-center-detail/${alertId}/${timeOffset}/${endTime}`);
          this.$location.url(`/hawkular-ui/alerts-center-detail/${alertId}`);
        };

        scope.alertResolve = (): void => {
          let resolvedAlerts = {
            alertIds: scope.alert.id,
            resolvedBy: scope.persona.name,
            resolvedNotes: 'Manually resolved'
          };
          this.HawkularAlertsManager.resolveAlerts(resolvedAlerts).then(() => {
            scope.refresh({ hkAlert: scope.alert });
          });
        };
      };
    }

    public static Factory() {
      let directive = (HawkularAlertsManager: any, $location: any) => {
        return new HkAlertPanel(HawkularAlertsManager, $location);
      };

      directive['$inject'] = ['HawkularAlertsManager', '$location'];

      return directive;
    }
  }

  export class HkAlertPanelList {

    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      alertList: '=hkAlertList',
      limit: '=hkLimit'
    };
    public templateUrl = 'plugins/metrics/html/directives/alert-list.html';

    constructor() {
      this.link = (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        scope.alertResolve = (alert): void => {
          for (let i = 0; i < scope.alertList.length; i++) {
            if (scope.alertList[i].id === alert.id) {
              scope.alertList.splice(i, 1);
              break;
            }
          }
        };
      };
    }

    public static Factory() {
      let directive = () => {
        return new HkAlertPanelList();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkTime {

    public static $inject = [];

    public humanizeTime(timeMillis: number): any {
      let result: any = {};

      let sec_num: number = Math.floor(timeMillis / 1000);
      let hours: number = Math.floor(sec_num / 3600);
      let minutes: number = Math.floor((sec_num - (hours * 3600)) / 60);
      let seconds: number = sec_num - (hours * 3600) - (minutes * 60);

      if (hours !== 0) {
        result.hours = hours;
      }
      if (minutes !== 0) {
        result.minutes = minutes;
      }
      if (seconds !== 0) {
        result.seconds = seconds;
      }

      return result;
    }
  }

  export class HkTimeInterval {

    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      hkTimeMillis: '=hkTime'
    };
    public templateUrl = 'plugins/metrics/html/directives/time-interval.html';

    constructor(private HkTime) {
      this.link = (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        scope.hkTime = HkTime.humanizeTime(scope.hkTimeMillis);
      };
    }

    public static Factory() {
      let directive = (HkTime: any) => {
        return new HkTimeInterval(HkTime);
      };

      directive['$inject'] = ['hkTime'];

      return directive;
    }
  }

  export class HkFieldsetNotification {

    public link: (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    public replace = 'true';
    public scope = {
      hkAlertEmail: '=',
      hkAlertEmailEnabled: '=',
      hkDisabled: '='
    };
    public templateUrl = 'plugins/metrics/html/directives/fieldset-notification.html';

    public static Factory() {
      let directive = () => {
        return new HkFieldsetNotification();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkTimeUnit {

    public static $inject = [];

    public timeUnits: Array<any> = [
      { value: 1, label: 'milliseconds' },
      { value: 1000, label: 'seconds' },
      { value: 60000, label: 'minutes' },
      { value: 3600000, label: 'hours' }
    ];

    public timeUnitDictionary: any = {};

    constructor() {
      _.forEach(this.timeUnits, (timeUnit: any) => {
        this.timeUnitDictionary[timeUnit.value] = timeUnit.label;
      });
    }

    // Get the most meaningful time unit (so that time value is not a very long fraction).
    public getFittestTimeUnit(timeValue: number): number {
      if (timeValue === 0) {
        return 1;
      }

      let timeUnit = 1;

      _.forEach(this.timeUnits, function(unit: any) {
        if (timeValue % unit.value === 0 && unit.value > timeUnit) {
          timeUnit = unit.value;
        }
      });

      return timeUnit;
    }

    public static Factory() {
      let directive = () => {
        return new HkTimeUnit();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkFieldsetDampening {

    public link: (scope: any) => void;
    public replace = 'true';
    public scope = {
      hkDuration: '=',
      hkSwitch: '=',
      hkDisabled: '=',
      hkTitle: '@',
      hkTitleMet: '@',
      hkTitleUnmet: '@'
    };
    public templateUrl = 'plugins/metrics/html/directives/fieldset-dampening.html';

    constructor(private hkTimeUnit: any) {
      this.link = (scope: any) => {
        let localChange = false;
        let durationBackup = scope.hkDuration || 0;

        scope.durationChange = (): void => {
          localChange = true;
        };

        scope.durationToggle = (): void => {
          if (scope.durationEnabled) {
            scope.hkDuration = durationBackup;
            if (scope.hkDuration !== 0) {
              scope.responseUnit = hkTimeUnit.getFittestTimeUnit(scope.hkDuration);
            }
          } else {
            durationBackup = scope.hkDuration;
            scope.hkDuration = 0;
          }
        };

        scope.$watch('hkDuration', () => {
          if (!localChange) {
            scope.durationEnabled = scope.hkDuration !== 0;
          }
          localChange = false;
        });

        scope.$watch('hkSwitch', () => {
          scope.hkSwitchEnabled = (scope.hkSwitch !== undefined);
        });
      };
    }

    public static Factory() {
      let directive = (hkTimeUnit: any) => {
        return new HkFieldsetDampening(hkTimeUnit);
      };

      directive['$inject'] = ['hkTimeUnit'];

      return directive;
    }
  }

  _module.service('hkTimeUnit', HawkularMetrics.HkTimeUnit.Factory());
  _module.service('hkTime', HawkularMetrics.HkTime);
  _module.directive('hkFieldsetNotification', [HawkularMetrics.HkFieldsetNotification.Factory()]);
  _module.directive('hkAlertPanelList', [HawkularMetrics.HkAlertPanelList.Factory()]);
  _module.directive('hkAlertPanel', [HawkularMetrics.HkAlertPanel.Factory()]);
  _module.directive('hkTimeInterval', [HawkularMetrics.HkTimeInterval.Factory()]);
  _module.directive('hkFieldsetDampening', [HawkularMetrics.HkFieldsetDampening.Factory()]);
  _module.directive('hkAlertInfo', [HawkularMetrics.HkAlertInfo.Factory()]);
  _module.directive('hkAlertSummary', [HawkularMetrics.HkAlertSummary.Factory()]);
}
