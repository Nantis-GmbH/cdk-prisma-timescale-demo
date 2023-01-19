import { Architecture, ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";

import {
  BundlingOptions,
  NodejsFunction,
  NodejsFunctionProps,
  OutputFormat,
} from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { combineLayerDependencies, LambdaLayer } from "./layers/lambda-layer";

type LambdaTypeScriptFunctionProps = Omit<NodejsFunctionProps, "runtime">;

export class LambdaFunctionTypescript extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    props: LambdaTypeScriptFunctionProps,
    outputFormat: OutputFormat = OutputFormat.ESM
  ) {
    const runtime = Runtime.NODEJS_18_X;

    const isLambdaLayer = (
      layer: ILayerVersion | undefined
    ): layer is LambdaLayer => {
      return !!layer;
    };

    const layers = [...new Set(props.layers)];

    const packageLayers: LambdaLayer[] = layers.filter(isLambdaLayer) ?? [];

    const externalModulesFromPackages = combineLayerDependencies(packageLayers);

    const bundling: BundlingOptions = {
      target: "esnext",
      format: outputFormat,
      ...props.bundling,
      externalModules: [
        ...(props.bundling?.externalModules ?? []),
        // Included in the nodejs 18 runtime
        ...["@aws-sdk"],
        ...externalModulesFromPackages,
      ],
    };

    const lambdaProps: NodejsFunctionProps = {
      ...props,
      runtime,
      architecture: Architecture.ARM_64,
      layers: layers,
      logRetention: RetentionDays.ONE_WEEK,
      initialPolicy: [
        ...(props.initialPolicy ?? []),
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ["*"],
          actions: [
            "logs:PutMetricFilter",
            "logs:DescribeLogStreams",
            "logs:PutRetentionPolicy",
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
        }),
      ],
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? Duration.seconds(6),
      bundling,
    };

    super(scope, id, lambdaProps);
  }
}
