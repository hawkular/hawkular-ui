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

import { Component, OnInit } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/finally';
import { environment } from './environment';

import { Metric } from './model/metric';
import { Configuration } from './model/configuration';
import { HawkularConfigService } from './hawkular-config.service';

@Component({
  selector: 'metrics-list',
  templateUrl: './metrics-list.component.html',
  styleUrls: ['./metrics-list.component.css']
})
export class MetricsListComponent {
  message = '';
  metrics: Metric[] = [];
  loading = false;
  selectedMetric: Metric;

  constructor (private http: Http, private configService: HawkularConfigService) {
    configService.observeHeaders().subscribe(h => this.fetchMetrics(h));
  }

  fetchMetrics(headers: Headers) {
    const h = setTimeout(() => this.loading = true, 500);
    this.message = '';
    this.metrics = [];
    if (!headers) {
      this.message = 'The tenant is not configured';
      clearTimeout(h);
      this.loading = false;
      return;
    }
    const options = new RequestOptions({ headers: headers });
    this.http.get(environment.metricsURL + '/metrics', options)
      .map((response) => response.json())
      .finally(() => {
        clearTimeout(h);
        this.loading = false;
      })
      .subscribe((metrics: Metric[]) => {
        if (metrics && metrics.length > 0) {
          this.metrics = metrics.sort((a,b) => {
              return a.id < b.id ? -1 : 1;
          });
          this.metrics.forEach(m => {
            m.url = m.tenantId + '/' + m.type + '/' + encodeURIComponent(m.id);
          });
          this.message = '';
        } else {
          this.message = 'No metric found for this tenant';
        }
      }, (err) => {
        if (err.status == 0 && err.statusText == '') {
          this.message = 'Could not connect to the server';
        } else {
          this.message = 'An error occured while accessing the server: [' + err.status + '] ' + err.statusText;
        }
      });
  }
}
