import { Bucket, StackContext } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export function StorageStack({ stack, app }: StackContext) {
  const bucket = new Bucket(stack, `${app.name}-bucket`, {
    cdk: {
      bucket: {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    },
  });

  stack.addOutputs({
    BucketName: bucket.bucketName,
    BucketArn: bucket.bucketArn,
    BucketRegion: app.region,
  });

  return {
    bucket,
  };
}
