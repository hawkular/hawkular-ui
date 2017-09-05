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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { HawkularChartsModule } from '@hawkular/hawkular-charts';

import { HawkularConfigService } from './hawkular-config.service';
import { AppComponent } from './app.component';
import { MetricsListComponent } from './metrics-list.component';
import { StatusPageComponent } from './status-page.component';
import { ConfigPageComponent } from './config-page.component';
import { ChartComponent } from './chart.component';

@NgModule({
  declarations: [
    AppComponent,
    MetricsListComponent,
    StatusPageComponent,
    ConfigPageComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HawkularChartsModule,
    RouterModule.forRoot([{
        path: '',
        redirectTo: '/r/status',
        pathMatch: 'full'
      }, {
        path: 'r/status',
        component: StatusPageComponent
      }
    ])
  ],
  providers: [HawkularConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
