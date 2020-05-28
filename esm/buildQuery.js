import buildVariables from "./buildVariables";
import buildGqlQuery from "./buildGqlQuery";
import getResponseParser from "./getResponseParser";
export var buildQueryFactory = function (buildVariablesImpl, buildGqlQueryImpl, getResponseParserImpl) { return function (introspectionResults) {
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
export default buildQueryFactory(buildVariables, buildGqlQuery, getResponseParser);
