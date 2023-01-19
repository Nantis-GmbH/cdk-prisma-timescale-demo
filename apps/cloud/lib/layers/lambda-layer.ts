import {
  AssetCode,
  LayerVersion,
  LayerVersionProps,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as fs from "fs";
import { join } from "path";

export class LambdaLayer extends LayerVersion {
  public readonly dependencies: string[] = [];

  constructor(scope: Construct, id: string, props: LayerVersionProps) {
    super(scope, id, props);

    if (props.code instanceof AssetCode) {
      const codePath = props.code.path;
      const packageFilePath = join(codePath, "nodejs", "package.json");

      if (fs.existsSync(packageFilePath)) {
        const data = fs.readFileSync(packageFilePath);

        const pack = JSON.parse(data.toString("utf-8"));
        this.dependencies = pack.dependencies
          ? Object.keys(pack.dependencies)
          : [];
      }
    }
  }
}

export const combineLayerDependencies = (layers: LambdaLayer[]): string[] => {
  return layers.reduce((dependencies, layer) => {
    return [...dependencies, ...layer.dependencies];
  }, [] as string[]);
};
