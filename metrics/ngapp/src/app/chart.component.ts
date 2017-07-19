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
import { MetricChartComponent } from '@hawkular/hawkular-charts';
import { environment } from './environment';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnChanges {
  timeframe: string = '6h';
  refreshRate = 5;
  title: string = '';
  notice: string = '';
  tenant: string;
  type: string;
  metric: string;
  loading = false;
  timeRange: number;
  useRawData = false;
  metricsURL = environment.metricsURL;
  displayChart = false;

  constructor(private route: ActivatedRoute) {
    this.timeRange = this.intervalToSeconds(this.timeframe);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.tenant = params['tenant'];
      this.type = params['type'];
      this.metric = params['metric'];
      this.refreshComputedVars();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshComputedVars();
  }

  refreshComputedVars() {
    this.notice = '';
    this.displayChart = false;
    if (this.tenant && this.type && this.metric) {
      this.title = "Tenant '" + this.tenant + "', " + this.type + " '" + this.metric + "'";
      if (this.type === 'availability' || this.type === 'string') {
        this.notice = 'Availability and String metrics cannot be displayed at this time'
      } else {
        this.displayChart = true;
      }
    } else {
      this.notice = 'Enter a tenant then select a metric from the left menu'
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
