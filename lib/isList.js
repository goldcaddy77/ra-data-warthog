"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var isList = function (type) {
    if (type.kind === graphql_1.TypeKind.NON_NULL) {
        return isList(type.ofType);
    }
    return type.kind === graphql_1.TypeKind.LIST;
};
exports.default = isList;
