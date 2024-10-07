import {
  AddCustomAttributesRequest,
  AddCustomAttributesResponse,
  AttributeDataType,
} from "@aws-sdk/client-cognito-identity-provider";
import { InvalidParameterError, MissingParameterError } from "../errors.js";
import { Services } from "../services/index.js";
import { assertParameterLength } from "./utils/assertions.js";
import { Target } from "./Target.js";

export type AddCustomAttributesTarget = Target<
  AddCustomAttributesRequest,
  AddCustomAttributesResponse
>;

type AddCustomAttributesServices = Pick<Services, "clock" | "cognito">;

export const AddCustomAttributes =
  ({
    clock,
    cognito,
  }: AddCustomAttributesServices): AddCustomAttributesTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.CustomAttributes)
      throw new MissingParameterError("CustomAttributes");

    assertParameterLength("CustomAttributes", 1, 25, req.CustomAttributes);

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    await userPool.updateOptions(ctx, {
      ...userPool.options,
      SchemaAttributes: [
        ...(userPool.options.SchemaAttributes ?? []),
        ...req.CustomAttributes.map(({ Name, ...attr }) => {
          const name = `custom:${Name ?? "null"}`;

          if (userPool.options.SchemaAttributes?.find((x) => x.Name === name)) {
            throw new InvalidParameterError(
              `${name}: Existing attribute already has name ${name}.`,
            );
          }

          return {
            AttributeDataType: AttributeDataType.STRING,
            DeveloperOnlyAttribute: false,
            Mutable: true,
            Required: false,
            StringAttributeConstraints: {},
            Name: name,
            ...attr,
          };
        }),
      ],
      LastModifiedDate: clock.get(),
    });

    return {};
  };
