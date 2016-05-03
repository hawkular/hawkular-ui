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

/// <reference path='../../includes.ts'/>

module HawkularAccounts {
  export let pluginName = 'hawkular-accounts';
  export let log: Logging.Logger = Logger.get(pluginName);
  export let templatePath = 'plugins/accounts/html';
  export let _module = angular.module(HawkularAccounts.pluginName, ['ui.bootstrap']);
  export type PersonaId = string;

  // simple data objects
  export interface IPersona {
    id: PersonaId;
    name: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface IToken {
    key: string;
    secret: string;
    principal: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    attributes: { [key: string]: string; };
    $update(options: {},
      success?: (success: IToken) => void,
      failure?: (error: IErrorPayload) => void);
    $remove(options: {},
      success?: (success: IToken) => void,
      failure?: (error: IErrorPayload) => void);
  }

  export interface IOrganization extends IPersona {
    owner: IPersona;
    $update(options: {},
      success?: (success: IOrganization) => void,
      failure?: (error: IErrorPayload) => void);
    $save(options: {},
      success?: (success: IOrganization) => void,
      failure?: (error: IErrorPayload) => void);
    $remove(options: {},
      success?: (success: IOrganization) => void,
      failure?: (error: IErrorPayload) => void);
  }

  export interface IJoinRequest {
    organization: IOrganization;
    decision: string;
    joinRequestId: string;
    id: string;
    organizationId: string;
    $update(options: {},
      success?: (success: IJoinRequest) => void,
      failure?: (error: IErrorPayload) => void);
    $save(options: {},
      success?: (success: IJoinRequest) => void,
      failure?: (error: IErrorPayload) => void);
  }

  export interface IInvitation {
    id: string;
    token: string;
    email: string;
    organization: IOrganization;
    role: IRole;
    acceptedAt: Date;
  }

  export interface IRole {
    id: string;
    name: string;
    description: string;
  }

  export interface IOperation {
    id: string;
    name: string;
  }

  export interface IResource {
    id: string;
  }

  export interface IOrganizationMembership {
    id: string;
    organization: IOrganization;
    member: IPersona;
    role: IRole;
    $update(options?: {},
      success?: (success: ISuccessPayload) => void,
      failure?: (error: IErrorPayload) => void);
    $get(options?: {},
      success?: (success: ISuccessPayload) => void,
      failure?: (error: IErrorPayload) => void);
  }

  export interface IUserSettings {
    id: string;
    $update(options?: {},
      success?: (success: IUserSettings) => void,
      failure?: (error: IErrorPayload) => void);
    $get(options?: {},
      success?: (success: IUserSettings) => void,
      failure?: (error: IErrorPayload) => void);
  }

  // specialized payloads, requests and responses
  export interface IDataPayload {
    message: string;
  }

  export interface IErrorPayload {
    data: IDataPayload;
  }

  export interface ISuccessPayload {
    data: IDataPayload;
  }

  export interface IPermissionResponse {
    permitted: boolean;
  }

  export interface IInvitationRequest {
    emails: string;
    $save(success?: (success: ISuccessPayload) => void, failure?: (error: IErrorPayload) => void): void;
  }

  export interface INotificationsService {
    info(message: string): void;
    success(message: string): void;
    warning(message: string): void;
    error(message: string): void;
  }

  export class Invitation implements IInvitation {
    public id: string;
    public token: string;
    public email: string;
    public organization: HawkularAccounts.IOrganization;
    public role: HawkularAccounts.IRole;
    public acceptedAt: Date;

    constructor(email: string, role: HawkularAccounts.IRole) {
      this.email = email;
      this.role = role;
    }
  }

  export class Role implements IRole {
    public id: string;
    public name: string;
    public description: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  export enum PersistenceState { PERSISTING, SUCCESS, ERROR };
  export enum EditState { READ, EDIT };
}
