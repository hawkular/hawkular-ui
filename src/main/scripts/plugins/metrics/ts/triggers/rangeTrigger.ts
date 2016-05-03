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
/// <reference path="../../includes.ts"/>
/// <reference path="../services/alertsManager.ts"/>
/// <reference path="../services/errorsManager.ts"/>

module HawkularMetrics {

  export class RangeTriggerSetupController extends TriggerSetupController {

    public loadTrigger(triggerId: string): Array<ng.IPromise<any>> {

      let triggerPromise = this.HawkularAlertsManager.getTrigger(triggerId).then(
        (triggerData) => {

          this.fullTrigger = triggerData;

          this.adm.trigger = {};
          // updateable
          this.adm.trigger['enabled'] = triggerData.trigger.enabled;
          this.adm.trigger['severity'] = triggerData.trigger.severity;

          this.adm.trigger['maxThreshold'] = triggerData.conditions[0].thresholdHigh;
          this.adm.trigger['minThreshold'] = triggerData.conditions[0].thresholdLow;

          if ( triggerData.trigger.actions !== undefined ) {
            triggerData.trigger.actions.forEach((triggerAction: ITriggerAction) => {
              this.adm.trigger[triggerAction.actionPlugin] = triggerAction.actionId;
            });
          }
          if ( this.adm.trigger['email'] === undefined || this.adm.trigger['email'] === null ) {
            this.adm.trigger['emailEnabled'] = false;
            this.adm.trigger['email'] = this.$rootScope.userDetails.email;
          } else {
            this.adm.trigger['emailEnabled'] = true;
          }

          this.adm.trigger['evalTimeSetting'] = super.getEvalTimeSetting(triggerData.dampenings[0].evalTimeSetting);

          // presentation
          // note: name, description not updateable at group level, should/will be at member level
          this.adm.trigger['context'] = triggerData.trigger.context;
          this.adm.trigger['conditionContext'] = triggerData.conditions[0].context;
          this.adm.trigger['description'] = triggerData.trigger.description;
          this.adm.trigger['name'] = triggerData.trigger.name;
        });

      return [triggerPromise];
    }

    public saveTrigger(errorCallback): Array<ng.IPromise<any>> {

      let updatedFullTrigger = angular.copy(this.fullTrigger);
      updatedFullTrigger.trigger.enabled = this.adm.trigger.enabled;
      updatedFullTrigger.trigger.severity = this.adm.trigger.severity;

      updatedFullTrigger.conditions[0].thresholdHigh = this.adm.trigger.maxThreshold;
      updatedFullTrigger.conditions[0].thresholdLow = this.adm.trigger.minThreshold;

      // manipulate the TriggerAction Set appropriately
      if ( this.adm.trigger.emailEnabled ) {
        updatedFullTrigger.trigger.actions = this.updateAction(
          updatedFullTrigger.trigger.actions, 'email', this.adm.trigger.email, null);  // TODO: properties
      } else {
        updatedFullTrigger.trigger.actions = this.removeAction( updatedFullTrigger.trigger.actions, 'email' );
      }

      // time == 0 is a flag for default dampening (i.e. Strict(1))
      if (this.adm.trigger.evalTimeSetting === 0) {
        updatedFullTrigger.dampenings[0].type = 'STRICT';
        updatedFullTrigger.dampenings[0].evalTrueSetting = 1;
        updatedFullTrigger.dampenings[0].evalTimeSetting = null;
      } else {
        updatedFullTrigger.dampenings[0].type = 'STRICT_TIME';
        updatedFullTrigger.dampenings[0].evalTrueSetting = 0;
        updatedFullTrigger.dampenings[0].evalTimeSetting = this.adm.trigger.evalTimeSetting;
      }

      let triggerSavePromise = this.HawkularAlertsManager.updateTrigger(updatedFullTrigger, errorCallback,
        this.fullTrigger);

      return [triggerSavePromise];
    }
  }

  _module.controller('RangeTriggerSetupController', RangeTriggerSetupController);
}
