var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE, DELETE } from 'ra-core';
import { QUERY_TYPES } from 'ra-data-graphql';
import { TypeKind } from 'graphql';
import * as gqlTypes from 'graphql-ast-types-browser';
import getFinalType from './getFinalType';
import isList from './isList';
import isRequired from './isRequired';
export var buildFragments = function (introspectionResults) { return function (possibleTypes) {
    return possibleTypes.reduce(function (acc, possibleType) {
        var type = getFinalType(possibleType);
        var linkedType = introspectionResults.types.find(function (t) { return t.name === type.name; });
        return __spreadArrays(acc, [
            gqlTypes.inlineFragment(gqlTypes.selectionSet(buildFields(introspectionResults)(linkedType.fields)), gqlTypes.namedType(gqlTypes.name(type.name))),
        ]);
    }, []);
}; };
export var buildFields = function (introspectionResults, path) {
    if (path === void 0) { path = []; }
    return function (fields) {
        return fields.reduce(function (acc, field) {
            var type = getFinalType(field.type);
            if (type.name.startsWith('_')) {
                return acc;
            }
            if (type.kind !== TypeKind.OBJECT && type.kind !== TypeKind.INTERFACE) {
                return __spreadArrays(acc, [gqlTypes.field(gqlTypes.name(field.name))]);
            }
            var linkedResource = introspectionResults.resources.find(function (r) { return r.type.name === type.name; });
            if (linkedResource) {
                return __spreadArrays(acc, [
                    gqlTypes.field(gqlTypes.name(field.name), null, null, null, gqlTypes.selectionSet([gqlTypes.field(gqlTypes.name('id'))])),
                ]);
            }
            var linkedType = introspectionResults.types.find(function (t) { return t.name === type.name; });
            if (linkedType && !path.includes(linkedType.name)) {
                return __spreadArrays(acc, [
                    gqlTypes.field(gqlTypes.name(field.name), null, null, null, gqlTypes.selectionSet(__spreadArrays(buildFragments(introspectionResults)(linkedType.possibleTypes || []), buildFields(introspectionResults, __spreadArrays(path, [
                        linkedType.name,
                    ]))(linkedType.fields)))),
                ]);
            }
            // NOTE: We might have to handle linked types which are not resources but will have to be careful about
            // ending with endless circular dependencies
            return acc;
        }, []);
    };
};
export var getArgType = function (arg) {
    var type = getFinalType(arg.type);
    var required = isRequired(arg.type);
    var list = isList(arg.type);
    if (list) {
        if (required) {
            return gqlTypes.listType(gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(type.name))));
        }
        return gqlTypes.listType(gqlTypes.namedType(gqlTypes.name(type.name)));
    }
    if (required) {
        return gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(type.name)));
    }
    return gqlTypes.namedType(gqlTypes.name(type.name));
};
export var buildArgs = function (query, variables) {
    if (query.args.length === 0) {
        return [];
    }
    var validVariables = Object.keys(variables).filter(function (k) { return typeof variables[k] !== 'undefined'; });
    var args = query.args
        .filter(function (a) { return validVariables.includes(a.name); })
        .reduce(function (acc, arg) { return __spreadArrays(acc, [
        gqlTypes.argument(gqlTypes.name(arg.name), gqlTypes.variable(gqlTypes.name(arg.name))),
    ]); }, []);
    return args;
};
export var buildApolloArgs = function (query, variables) {
    if (query.args.length === 0) {
        return [];
    }
    var validVariables = Object.keys(variables).filter(function (k) { return typeof variables[k] !== 'undefined'; });
    var args = query.args
        .filter(function (a) { return validVariables.includes(a.name); })
        .reduce(function (acc, arg) {
        return __spreadArrays(acc, [
            gqlTypes.variableDefinition(gqlTypes.variable(gqlTypes.name(arg.name)), getArgType(arg)),
        ]);
    }, []);
    return args;
};
export default (function (introspectionResults) { return function (resource, aorFetchType, queryType, variables) {
    var sortField = variables.sortField, sortOrder = variables.sortOrder, metaVariables = __rest(variables, ["sortField", "sortOrder"]);
    var apolloArgs = buildApolloArgs(queryType, variables);
    var args = buildArgs(queryType, variables);
    var metaArgs = buildArgs(queryType, metaVariables);
    var fields = buildFields(introspectionResults)(resource.type.fields);
    if (aorFetchType === GET_LIST ||
        aorFetchType === GET_MANY ||
        aorFetchType === GET_MANY_REFERENCE) {
        return gqlTypes.document([
            gqlTypes.operationDefinition('query', gqlTypes.selectionSet([
                gqlTypes.field(gqlTypes.name(queryType.name), gqlTypes.name('items'), args, null, gqlTypes.selectionSet(fields)),
                gqlTypes.field(gqlTypes.name("_" + queryType.name + "Meta"), gqlTypes.name('total'), metaArgs, null, gqlTypes.selectionSet([
                    gqlTypes.field(gqlTypes.name('count')),
                ])),
            ]), gqlTypes.name(queryType.name), apolloArgs),
        ]);
    }
    if (aorFetchType === DELETE) {
        return gqlTypes.document([
            gqlTypes.operationDefinition('mutation', gqlTypes.selectionSet([
                gqlTypes.field(gqlTypes.name(queryType.name), gqlTypes.name('data'), args, null, gqlTypes.selectionSet([
                    gqlTypes.field(gqlTypes.name('id')),
                ])),
            ]), gqlTypes.name(queryType.name), apolloArgs),
        ]);
    }
    return gqlTypes.document([
        gqlTypes.operationDefinition(QUERY_TYPES.includes(aorFetchType) ? 'query' : 'mutation', gqlTypes.selectionSet([
            gqlTypes.field(gqlTypes.name(queryType.name), gqlTypes.name('data'), args, null, gqlTypes.selectionSet(fields)),
        ]), gqlTypes.name(queryType.name), apolloArgs),
    ]);
}; });
