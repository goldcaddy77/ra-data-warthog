import { TypeKind } from 'graphql';
var isRequired = function (type) {
    if (type.kind === TypeKind.LIST) {
        return isRequired(type.ofType);
    }
    return type.kind === TypeKind.NON_NULL;
};
export default isRequired;
