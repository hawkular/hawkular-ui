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

import { Component } from '@angular/core';
import { HawkularConfigService } from './hawkular-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showGrafanaAlert = false;
  tenant = '';

  constructor (private configService: HawkularConfigService) {
    configService.observeConfig().subscribe(cfg => this.tenant = cfg.tenant);
  }

  refresh(event) {
    // Simulate a config change so that config subscribers force refresh
    this.configService.set(this.configService.get());
    // Not sure why, we need "stopPropagation" AND return false to prevent the parent routerLink to be activated
    event.stopPropagation();
    return false;
  }
}
