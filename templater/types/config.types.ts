import { IAnswersBase } from './types';

export interface IConfig {
  variables: IConfigVariables;
  explicit?: boolean;
  domains: IConfigDomain[];
}

export interface IConfigDomain {
  name: string;
  structure: any;
  templates: IConfigComponentTemplates[];
  questions: IConfigComponentQuestion[];
}

export interface IConfigComponentTemplates {
  name: string | ((answers: IAnswersBase) => string);
  template: string;
  when?: (answers: IAnswersBase) => boolean;
}

export interface IConfigComponentQuestion {
  name: string;
  message: string;
  type: string;
  required?: boolean;
  validate?: (input: any) => boolean;
}

export interface IConfigVariablesRequired {
  root: string;
}

export type IConfigVariables = IConfigVariablesRequired & Record<string, string>;
