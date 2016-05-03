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

/// <reference path='topologyGlobals.ts'/>

module HawkularTopology {

  _module.config(
    ($routeProvider, HawtioNavBuilderProvider: HawtioMainNav.BuilderFactory) => {

      $routeProvider
        .when(
        '/hawkular-ui/topology/view',
        { templateUrl: HawtioNavBuilderProvider.join(HawkularTopology.templatePath, 'index.html') }
        );
    });

  export class TopologyController {
    private data: any;
    private requestPending: boolean;
    //private index = 0;
    private kinds: any;
    private typeToKind: Object;
    private kindToType: Object;
    private autoRefreshPromise: ng.IPromise<any>;

    constructor(private $rootScope: any,
      private $scope: any,
      private $interval: ng.IIntervalService,
      private $q: any,
      private HawkularInventory: any) {

      if ($rootScope.currentPersona) {
        this.listenToInventoryEvents(this.$rootScope.currentPersona.id);
      } else {
        // currentPersona hasn't been injected to the rootScope yet, wait for it..
        $rootScope.$watch('currentPersona', (currentPersona) =>
          currentPersona && this.listenToInventoryEvents(this.$rootScope.currentPersona.id)
        );
      }

      $scope.$on('SwitchedPersona', () => {
        this.getData();
        this.listenToInventoryEvents(this.$rootScope.currentPersona.id);
      });

      this.kinds = {
        Server: 'S',
        DataSource: '',
        Platform: '',
        App: ''
      };

      this.typeToKind = {
        'WildFly Server': 'Server',
        'Datasource': 'DataSource',
        'Deployment': 'App',
        'Operating System': 'Platform'
      };

      this.kindToType = this.invert(this.typeToKind);

      // fetch the data from the inventory
      this.getData();
      this.autoRefresh(20);
    }

    private invert(obj) {
      const new_obj = {};
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          new_obj[obj[prop]] = prop;
        }
      }
      return new_obj;
    };

    private autoRefresh(intervalInSeconds: number): void {
      this.autoRefreshPromise = this.$interval(() => {
        this.getData();
      }, intervalInSeconds * 1000);

      this.$scope.$on('$destroy', () => {
        this.$interval.cancel(this.autoRefreshPromise);
      });
    }

    private getResourcesForResType(feedId: string, resourceType: string) {
      return this.HawkularInventory.ResourceOfTypeUnderFeed.query({
        environmentId: globalEnvironmentId,
        feedId: feedId,
        resourceTypeId: resourceType
      }).$promise;
    }

    public getDataForOneFeed(feedId: string): ng.IPromise<any> {
      const promises = _.map(_.keys(this.typeToKind), (type) => this.getResourcesForResType(feedId, _.escape(type)));
      return this.$q.all(promises);
    }

    public getServerMetadata(feedId: string, serverId: string, metadata: any) {
      this.HawkularInventory.ResourceUnderFeed.getData({
        environmentId: globalEnvironmentId,
        feedId: feedId,
        resourcePath: serverId
      }, (data) => {
        metadata.metadata.ip = data.value['Bound Address'];
        metadata.metadata.hostname = data.value.Hostname;
        metadata.metadata.version = data.value.Version;
      });
    }

    public getData(): any {
      this.requestPending = true;

      const extractServerId = (id: string): string => id.substring(0, id.indexOf('/')) + '~';
      const extractFeedId = (path: string): string => {
        const feedChunk = path.split('/').filter((chunk) => _.startsWith(chunk, 'f;'));
        return feedChunk.length === 1 && feedChunk[0] ? feedChunk[0].slice(2) : 'localhost';
      };

      this.HawkularInventory.Feed.query({ environmentId: globalEnvironmentId }, (aFeedList) => {
        if (!aFeedList.length) {
          this.requestPending = false;
          return;
        }
        let promises = [];
        angular.forEach(aFeedList, (feed) => {
          promises.push(this.getDataForOneFeed(feed.id));
        });
        this.$q.all(promises).then((aResourceList) => {
          let newRelations = [];
          let newData = {
            items: {},
            relations: {}
          };
          const flatResources = _.flatten(aResourceList, true);
          if (!flatResources.length) {
            this.requestPending = false;
            return;
          }
          let previousServerId;
          angular.forEach(flatResources, (res: any) => {
            const feedId = extractFeedId(res.path);
            const newItem = {
              kind: this.typeToKind[res.type.id],
              id: res.id,
              metadata: {
                name: res.name,
                feedId: feedId
              }
            };
            // add edge from server
            if (newItem.kind !== 'Server') {
              if (newItem.kind === 'Platform') {
                newRelations.push({
                  source: res.id,
                  target: previousServerId,
                  type: 'platform'
                });
              } else {
                let desiredServerId = extractServerId(res.id);
                desiredServerId = desiredServerId === '~' ? previousServerId : desiredServerId;
                previousServerId = desiredServerId;
                newRelations.push({
                  source: desiredServerId,
                  target: res.id
                });
              }
            } else {
              this.getServerMetadata(feedId, res.id, newItem);
            }
            newData.items[res.id] = newItem;
          });
          newData.relations = newRelations;
          this.data = newData;
          this.requestPending = false;
        });
      });
    }

    private processNewResource(json) {
      const types = _.filter(_.keys(this.kinds), (kind) => json.type.id === this.kindToType[kind]);
      _.forEach(types, (type) => {
        console.log('New ' + type + ' has been added to inventory.');
        this.getData();
      });
    }

    public listenToInventoryEvents(tenantId) {
      const handler: hawkularRest.IWebSocketHandler = {
        onmessage: (json) => {
          console.log(json);
          this.processNewResource(json);
        }
      };
      this.HawkularInventory.Events(tenantId).listen(handler);
    }

  }

  _module.controller('HawkularTopology.TopologyController', TopologyController);

  // so the same scroll doesn't trigger multiple times
  angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

  hawtioPluginLoader.addModule(HawkularTopology.pluginName);
}
