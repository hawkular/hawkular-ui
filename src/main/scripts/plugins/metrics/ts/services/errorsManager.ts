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

module HawkularMetrics {

  export interface IErrorsManager {
    errorHandler(error: any, msg: string, cb?: (error: any, msg: string) => void): any;
  }

  export class ErrorsManager implements IErrorsManager {

    public static $inject = ['$q', '$log', 'NotificationsService'];

    constructor(private $q: ng.IQService,
      private $log: ng.ILogService,
      private NotificationsService: INotificationsService) {
    }

    private errorToastr(error: any, errorMsg: string): void {
      let errorMsgComplete: string;

      if (error.data && error.data.errorMsg) {
        errorMsgComplete = error.data.errorMsg;
      } else {
        errorMsgComplete = errorMsg + ' ' + error;
      }

      this.NotificationsService.error(errorMsgComplete);
    }

    public errorHandler(error: any, msg: string, cb?: (error: any, msg: string) => void): ng.IPromise<void> {
      if (error) {
        const type = 'error';
        const notificationMessage = new NotificationMessage(msg, type, MessageType[type.toUpperCase()]);
        this.NotificationsService.storedMessages.unshift(notificationMessage);
        this.errorToastr(error, msg);
        if (cb) {
          cb(error, msg);
        }
      }
      return this.$q.reject(null);
    }
  }

  _module.service('ErrorsManager', ErrorsManager);
}
