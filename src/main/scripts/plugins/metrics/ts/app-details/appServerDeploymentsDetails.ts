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
/// <reference path="../services/alertsManager.ts"/>
/// <reference path="../services/errorsManager.ts"/>

module HawkularMetrics {

  export class AppServerDeploymentsDetailsController implements IRefreshable {

    private autoRefreshPromise: ng.IPromise<number>;
    private resourceList;
    public pendingOps: any = {};
    public alertList: any[] = [];
    public selectCount: number = 0;
    public startTimeStamp: TimestampInMillis;
    public endTimeStamp: TimestampInMillis;

    /// for list filtering
    public search: string;

    constructor(private $scope: any,
      private $rootScope: IHawkularRootScope,
      private $interval: ng.IIntervalService,
      private $log: ng.ILogService,
      private $routeParams: any,
      private $filter: any,
      private $modal: any,
      private HawkularInventory: any,
      private HawkularMetric: any,
      private HawkularOps: any,
      private HawkularAlertsManager: IHawkularAlertsManager,
      private HawkularAlertRouterManager: IHawkularAlertRouterManager,
      private ErrorsManager: IErrorsManager,
      private $location: ng.ILocationService,
      private $q: ng.IQService,
      private NotificationsService: INotificationsService) {
      $scope.vm = this;
      HawkularOps.init(this.NotificationsService);

      if ($routeParams.action && $routeParams.action === 'add-new') {
        this.showDeploymentAddDialog();
        $location.search('action', null);
      }

      if ($rootScope.currentPersona) {
        this.refresh();
      } else {
        // currentPersona hasn't been injected to the rootScope yet, wait for it..
        $rootScope.$watch('currentPersona', (currentPersona) => currentPersona && this.refresh());
      }

      this.HawkularAlertRouterManager.registerForAlerts(
        this.$routeParams.resourceId,
        'deployments',
        _.bind(this.filterAlerts, this)
      );
      this.getAlerts();

      $scope.$on('ExecuteOperationSuccess', (event, message, resource, operation) => {
        this.pendingOps[resource] = false;
        this.NotificationsService.success(message);
      });

      $scope.$on('ExecuteOperationError', (event, message, resource, operation) => {
        this.pendingOps[resource] = false;
        this.NotificationsService.error(message);
      });

      this.autoRefresh(20);
    }

    private autoRefresh(intervalInSeconds: number): void {
      this.autoRefreshPromise = this.$interval(() => {
        this.refresh();
      }, intervalInSeconds * 1000);

      this.$scope.$on('$destroy', () => {
        this.$interval.cancel(this.autoRefreshPromise);
      });
    }

    public refresh(): void {
      this.endTimeStamp = this.$routeParams.endTime || +moment();
      this.startTimeStamp = this.endTimeStamp - (this.$routeParams.timeOffset || 3600000);

      this.getResourceList();
      this.getAlerts();

      this.$rootScope.lastUpdateTimestamp = new Date();
    }

    public showDeploymentAddDialog(): void {

      this.$log.debug('Starting Show Add Dialog');

      /// create a new isolate scope for dialog inherited from current scope instead of default $rootScope
      let deployAddDialog = this.$modal.open({
        templateUrl: 'plugins/metrics/html/app-details/modals/detail-deployments-add.html',
        controller: 'AppServerDeploymentsAddDialogController as dac',
        scope: this.$scope.$new()
      });

      let logger = this.$log;
      deployAddDialog.result.then((modalValue) => {
        logger.debug('Modal Closed: ' + modalValue);

      }, (reason) => {
        logger.debug('Modal cancelled at: ' + new Date());
      });
    }

    public filterAlerts(alertData: IHawkularAlertQueryResult) {
      let deploymentAlerts = alertData.alertList;
      _.remove(deploymentAlerts, (item: IAlert) => {
        switch (item.context.alertType) {
          case 'DEPLOYMENT_FAIL':
            item.alertType = item.context.alertType;
            return false;
          default: return true; // ignore non-jvm alert
        }
      });
      this.alertList = deploymentAlerts;
    }

    private getAlerts(): void {
      this.HawkularAlertRouterManager.getAlertsForCurrentResource(
        this.startTimeStamp,
        this.endTimeStamp
      );
    }

    public getResourceList(currentTenantId?: TenantId): void {
      let tenantId: TenantId = currentTenantId || this.$rootScope.currentPersona.id;
      this.HawkularInventory.ResourceOfTypeUnderFeed.query({
        feedId: this.$routeParams.feedId,
        resourceTypeId: 'Deployment'
      }, (aResourceList: IResource[], getResponseHeaders) => {
        let promises = [];
        let tmpResourceList = [];
        _.forEach(aResourceList, (res: IResource) => {
          if (res.id.indexOf(this.$routeParams.resourceId + '~/') === 0) {
            tmpResourceList.push(res);
            res.feedId = this.$routeParams.feedId;
            res.selected = !!_.result(_.find(this.resourceList, { 'id': res.id }), 'selected');
            promises.push(this.HawkularMetric.AvailabilityMetricData(this.$rootScope.currentPersona.id).query({
              tenantId: tenantId,
              availabilityId: MetricsService.getMetricId('A', res.feedId, res.id,
                'Deployment Status~Deployment Status'),
              distinct: true
            }, (availResource: IAvailResource[]) => {
              let latestData = _.first(availResource);
              if (latestData) {
                res.state = latestData.value;
                res.updateTimestamp = latestData.timestamp;
              }
            }).$promise);
          }
        }, this);
        this.$q.all(promises).then((notUsed) => {
          this.resourceList = tmpResourceList;
          this.resourceList.$resolved = true;
        });
      },
        () => { // error
          if (!this.resourceList) {
            this.resourceList = [];
            this.resourceList.$resolved = true;
          }
        });
    }

    public performOperationMulti(operationName: string): void {
      let selectedList = _.filter(this.resourceList, 'selected');
      this.$log.log(`performOperationMulti for operation: ${operationName}`);
      _.forEach(selectedList, (item: any) => {
        let operation = {
          operationName: operationName,
          resourcePath: item.path,
          authentication: {
            token: this.$rootScope.userDetails.token,
            persona: this.$rootScope.currentPersona.id
          }
        };
        item.selected = false;
        this.pendingOps[item.path] = true;
        this.HawkularOps.performOperation(operation);
      });
    }

    public selectItem(item): void {
      item.selected = !item.selected;
      this.selectCount = _.filter(this.resourceList, 'selected').length;
    }

    public selectAll(): void {
      let filteredList = this.$filter('filter')(this.resourceList, this.search);
      let toggleTo = this.selectCount !== filteredList.length;
      _.forEach(filteredList, (item: any) => {
        item.selected = toggleTo;
      });
      this.selectCount = toggleTo ? filteredList.length : 0;
    }
  }

  _module.controller('AppServerDeploymentsDetailsController', AppServerDeploymentsDetailsController);

}
