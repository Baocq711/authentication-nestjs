import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isObject,
} from 'class-validator';

export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          return isUniqueArray(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must have unique values`;
        },
      },
    });
  };
}
export function isUniqueArray(value: any[]) {
  if (isObject(value[0])) {
    return new Set(value.map((item) => item.id)).size === value.length;
  }

  return new Set(value).size === value.length;
}
