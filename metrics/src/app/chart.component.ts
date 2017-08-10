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

import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AvailChartComponent } from '@hawkular/hawkular-charts';
import { HawkularConfigService } from './hawkular-config.service';
import { environment } from './environment';
import { Configuration } from './model/configuration';
import { MetricRouteParam, fromKeys } from './model/metric-route-param';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnChanges {
  timeframe: string = '6h';
  refreshRate = 30;
  title = '';
  types: string;
  notice = '';
  warning = '';
  hawkularConfig: Configuration;
  metrics: MetricRouteParam[] = [];
  numericMetrics: MetricRouteParam[] = [];
  availMetrics: MetricRouteParam[] = [];
  stringMetrics: MetricRouteParam[] = [];
  loading = false;
  timeRange: number;
  buckets = 50;
  metricsURL = environment.metricsURL;
  authHeader: string;

  constructor(private route: ActivatedRoute, private configService: HawkularConfigService) {
    this.hawkularConfig = configService.get();
    const headers = configService.getHeaders();
    if (headers) {
      this.authHeader = headers.get('Authorization');
    }
    this.timeRange = this.intervalToSeconds(this.timeframe);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const tenant = params['tenant'];
      if (params['metrics']) {
        this.metrics = fromKeys(params['metrics'].split(','));
      }
      if (tenant != this.hawkularConfig.tenant) {
        this.hawkularConfig.tenant = tenant;
        // Update config outside of ng-init process (there's no hurry)
        setTimeout(() => this.configService.set(this.hawkularConfig), 400);
      }
      this.refreshComputedVars();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshComputedVars();
  }

  refreshComputedVars() {
    this.notice = '';
    this.warning = '';
    this.numericMetrics = [];
    this.availMetrics = [];
    this.stringMetrics = [];
    if (!this.hawkularConfig.tenant) {
      this.warning = 'The tenant is not configured';
    } else if (this.metrics.length > 0) {
      this.metrics.forEach(m => {
        if (m.type === 'string') {
          this.stringMetrics.push(m);
        } else if (m.type === 'availability') {
          this.availMetrics.push(m);
        } else {
          this.numericMetrics.push(m);
        }
      });
      this.title = this.metrics.map(m => m.name).join(', ');
      this.types = Array.from(new Set(this.metrics.map(m => m.type))).join(', ');
    } else {
      this.notice = 'Select a metric from the left menu';
    }
  }

  intervalToSeconds(value) {
    const regexExtract = /(\d+)(.+)/g.exec(value);
    const val = +regexExtract[1];
    const unit = regexExtract[2];
    let mult = 1;
    if (unit == 'm') {
      mult *= 60;
    } else if (unit == 'h') {
      mult *= 3600;
    } else if (unit == 'd') {
      mult *= 86400;
    }
    return val * mult;
  }

  onTimeFrameChanged(event) {
    this.timeRange = this.intervalToSeconds(this.timeframe);
  }

  childTimeRangeChange(event) {
    if (event.hasOwnProperty('start')) {
      this.timeframe = 'custom';
    }
  }
}
