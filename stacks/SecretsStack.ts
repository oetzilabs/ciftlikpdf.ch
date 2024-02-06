import { Config, StackContext } from "sst/constructs";

export function SecretsStack({ stack }: StackContext) {
  const secrets = Config.Secret.create(stack, "DATABASE_URL", "DATABASE_AUTH_TOKEN", "JWT_SECRET");

  return secrets;
}
