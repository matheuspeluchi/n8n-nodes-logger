import { IExecuteFunctions } from "n8n-core";

import {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import pino from "pino";

export class Logger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Logger",
    name: "Logger",
    icon: "file:log.svg",
    group: ["input"],
    version: 1,
    description: "Generete unique id for any",
    defaults: {
      name: "Logger",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [],
    properties: [
      {
        displayName: "Type",
        name: "type",
        type: "options",
        noDataExpression: true,
        default: "data",
        options: [
          {
            name: "Node",
            value: "node",
            description: "Log result of last node",
            action: "Log node",
          },
          {
            name: "Data",
            value: "data",
            description: "Log any data",
            action: "Log data",
          },
        ],
      },
      {
        displayName: "GUUID",
        name: "guuid",
        type: "string",
        required: true,
        noDataExpression: false,
        default: "{{$node['GUUID']['json'].uuid }}",
      },
      {
        displayName: "Level",
        name: "level",
        type: "options",
        noDataExpression: true,
        default: "info",
        options: [
          {
            name: "Debug",
            value: "debug",
            description: "Log debug",
          },
          {
            name: "Info",
            value: "info",
            description: "Log info",
          },
          {
            name: "Warning",
            value: "warn",
            description: "Log warning",
          },
          {
            name: "Error",
            value: "error",
            description: "Log error",
          },
          {
            name: "Fatal",
            value: "fatal",
            description: "Log fatal",
          },
          {
            name: "Trace",
            value: "trace",
            description: "Log trace",
          },
        ],
      },
      {
        displayName: "Data",
        name: "data",
        type: "json",
        required: true,
        noDataExpression: false,
        displayOptions: {
          show: {
            type: ["data"],
          },
        },
        typeOptions: {
          rows: 4,
        },
        default: "",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const logger = pino({
      formatters: {
        level: (label) => {
          return {
            level: label,
          };
        },
      },
    });
    const sourceLog = this.getNodeParameter("type", 0) as string;
    const level: pino.Level = this.getNodeParameter("level", 0) as pino.Level;

    const log = {
      workflowId: this.getWorkflow().id,
      guuid: this.getNodeParameter("guuid", 0) as string,
      context: this.getContext,
      data:
        sourceLog === "data"
          ? this.getNodeParameter("data", 0)
          : this.getInputData()[0].json,
    };

    logger[level](log);

    let returnItems = this.helpers.returnJsonArray(
      log as unknown as IDataObject[]
    );

    return this.prepareOutputData(returnItems);
  }
}
