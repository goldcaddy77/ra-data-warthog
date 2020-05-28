"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQueryFactory = void 0;
var buildVariables_1 = __importDefault(require("./buildVariables"));
var buildGqlQuery_1 = __importDefault(require("./buildGqlQuery"));
var getResponseParser_1 = __importDefault(require("./getResponseParser"));
exports.buildQueryFactory = function (buildVariablesImpl, buildGqlQueryImpl, getResponseParserImpl) { return function (introspectionResults) {
    console.log("introspectionResults", introspectionResults);
    var knownResources = introspectionResults.resources.map(function (r) { return r.type.name; });
    return function (aorFetchType, resourceName, params) {
        var resource = introspectionResults.resources.find(function (r) { return r.type.name === resourceName; });
        if (!resource) {
            throw new Error("Unknown resource " + resourceName + ". Make sure it has been declared on your server side schema. Known resources are " + knownResources.join(", "));
        }
        var queryType = resource[aorFetchType];
        if (!queryType) {
            throw new Error("No query or mutation matching fetch type " + aorFetchType + " could be found for resource " + resource.type.name);
        }
        var variables = buildVariablesImpl(introspectionResults)(resource, aorFetchType, params, queryType);
        var query = buildGqlQueryImpl(introspectionResults)(resource, aorFetchType, queryType, variables);
        var parseResponse = getResponseParserImpl(introspectionResults)(aorFetchType, resource, queryType);
        return {
            query: query,
            variables: variables,
            parseResponse: parseResponse,
        };
    };
}; };
exports.default = exports.buildQueryFactory(buildVariables_1.default, buildGqlQuery_1.default, getResponseParser_1.default);
