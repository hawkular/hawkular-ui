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
import { Configuration } from './model/configuration';
import { HawkularConfigService } from './hawkular-config.service';

@Component({
  selector: 'config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.css']
})
export class ConfigPageComponent {
  config: Configuration;
  changed = false;

  constructor (private configService: HawkularConfigService) {
    this.config = configService.get();
    configService.observeConfig().subscribe(cfg => this.config = cfg);
  }

  onSubmit(event) {
    this.configService.set(this.config);
    this.changed = false;
  }

  onReset(event) {
    this.config = this.configService.get();
    this.changed = false;
  }
}
