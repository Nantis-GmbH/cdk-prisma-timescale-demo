import { LambdaLayer } from "./lambda-layer";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { getFilePath } from "../../util/get-file-path";
import { SymlinkFollowMode } from "aws-cdk-lib";
import { Construct } from "constructs";

export class LambdaLayers extends Construct {
  public readonly prismaLayer: LambdaLayer;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const inputDir = "nodejs/node_modules";

    this.prismaLayer = new LambdaLayer(this, "LambdaLayer", {
      code: Code.fromAsset(getFilePath(import.meta.url, "prisma"), {
        followSymlinks: SymlinkFollowMode.ALWAYS,
        exclude: [
          `${inputDir}/.bin`,
          `${inputDir}/prisma`,
          `${inputDir}/@nantis/prisma/node_modules/prisma`,
          `${inputDir}/@nantis/prisma/node_modules/.bin`,
          `${inputDir}/@nantis/prisma/node_modules/.cache`,
          `${inputDir}/@nantis/prisma/node_modules/ts-node`,
          `${inputDir}/@nantis/prisma/node_modules/tsup`,
          `${inputDir}/@nantis/prisma/node_modules/typescript`,
          `${inputDir}/@nantis/prisma/node_modules/@types`,
          `${inputDir}/@nantis/prisma/node_modules/.prisma/client/query_engine-windows.dll.node`,
        ],
      }),
      compatibleArchitectures: [Architecture.ARM_64],
      compatibleRuntimes: [Runtime.NODEJS_18_X],
    });
  }
}
