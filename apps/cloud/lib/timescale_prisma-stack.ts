import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getFilePath } from "../util/get-file-path";
import { LambdaLayers } from "./layers/lambda-layers";
import { LambdaFunctionTypescript } from "./lambda-function-typescript";
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";
import {CfnOutput, Duration} from "aws-cdk-lib";
import {FunctionUrl, FunctionUrlAuthType} from "aws-cdk-lib/aws-lambda";

export class TimescalePrismaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // We put prisma in a layer, so we can correctly bundle the binaries and also reuse it across functions
    const layers = new LambdaLayers(this, "LambdaLayers");

    // Metrics come from somewhere, so we "simulate" metrics coming in from somewhere by setting up a lambda call each minute
    // This function writes to the timescale database via prisma
    const ingressHandler = new LambdaFunctionTypescript(this, "IngressHandler", {
      entry: getFilePath(import.meta.url, "ingress-handler-function.ts"),
      environment: {
        'DATABASE_URL': process.env.DATABASE_URL!
      },
      layers: [layers.prismaLayer],
    });

    const eventRule = new Rule(this, 'SimulateRule', {
      schedule: Schedule.rate(Duration.minutes(1)),
    });

    eventRule.addTarget(new LambdaFunction(ingressHandler))

    // Now we somehow want to get our metrics back from the database, so we add an "API"
    const apiHandler = new LambdaFunctionTypescript(this, "APIHandler", {
      entry: getFilePath(import.meta.url, "api-handler-function.ts"),
      environment: {
        'DATABASE_URL': process.env.DATABASE_URL!
      },
      layers: [layers.prismaLayer],
    });

    const functionUrl = new FunctionUrl(this, "Url", {
      function: apiHandler,
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "APIFunctionUrl", {
      value: functionUrl.url
    })
  }
}
