"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var isRequired = function (type) {
    if (type.kind === graphql_1.TypeKind.LIST) {
        return isRequired(type.ofType);
    }
    return type.kind === graphql_1.TypeKind.NON_NULL;
};
exports.default = isRequired;
