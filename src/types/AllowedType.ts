export enum AllowedType {
   STRING = 'string',
   NUMBER = 'number',
   BIGINT = 'bigint',
   BOOLEAN = 'boolean',
}

export function isAllowedType(val: unknown): val is AllowedType {
   if (
      typeof val == 'string' &&
      Object.values(AllowedType).includes(val as AllowedType)
   ) {
      return true
   }
   return false
}
