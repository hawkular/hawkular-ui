///
/// Copyright 2014-2017 Red Hat, Inc. and/or its affiliates
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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Configuration } from './model/configuration';
import { Headers } from '@angular/http';

@Injectable()
export class HawkularConfigService {
  private config: Configuration = {
    tenant: '',
    auth: {
      method: 'none',
      token: null,
      username: null,
      password: null
    }
  };
  private configObservable = new BehaviorSubject<Configuration>(cloneConfig(this.config));
  private headersObservable = new BehaviorSubject<Headers | undefined>(this.getHeaders());

  set(config: Configuration) {
    this.config = cloneConfig(config);
    this.configObservable.next(cloneConfig(this.config));
    this.headersObservable.next(this.getHeaders());
  }

  get(): Configuration {
    return cloneConfig(this.config);
  }

  observeConfig(): BehaviorSubject<Configuration> {
    return this.configObservable;
  }

  observeHeaders(): BehaviorSubject<Headers | undefined> {
    return this.headersObservable;
  }

  getHeaders(): Headers | undefined {
    if (this.config.tenant && this.config.auth.method != 'none') {
      const authHeader = this.config.auth.method == 'basic'
          ? 'Basic ' + btoa(this.config.auth.username + ":" + this.config.auth.password)
          : 'Bearer ' + this.config.auth.token;
      return new Headers({
        'Hawkular-Tenant': this.config.tenant,
        'Authorization': authHeader
      });
    } else if (this.config.tenant) {
      return new Headers({
        'Hawkular-Tenant': this.config.tenant
      });
    }
    return undefined;
  }
}

export function cloneConfig(config: Configuration): Configuration {
  return {
    tenant: config.tenant,
    auth: {
      method: config.auth.method,
      token: config.auth.token,
      username: config.auth.username,
      password: config.auth.password
    }
  };
}
