var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/* eslint-disable default-case */
import { GET_LIST, GET_ONE, GET_MANY, GET_MANY_REFERENCE, CREATE, UPDATE, DELETE, } from "ra-core";
import getFinalType from "./getFinalType";
import isList from "./isList";
var sanitizeValue = function (type, value) {
    if (type.name === "Int") {
        return parseInt(value, 10);
    }
    if (type.name === "Float") {
        return parseFloat(value);
    }
    return value;
};
var castType = function (value, type) {
    switch (type.kind + ":" + type.name) {
        case "SCALAR:Int":
            return Number(value);
        case "SCALAR:String":
            return String(value);
        case "SCALAR:Boolean":
            return Boolean(value);
        default:
            return value;
    }
};
var prepareParams = function (params, queryType, introspectionResults) {
    var result = {};
    if (!params) {
        return params;
    }
    Object.keys(params).forEach(function (key) {
        var param = params[key];
        var arg = null;
        if (!param) {
            result[key] = param;
            return;
        }
        if (queryType && Array.isArray(queryType.args)) {
            arg = queryType.args.find(function (item) { return item.name === key; });
        }
        if (param instanceof File) {
            result[key] = param;
            return;
        }
        if (param instanceof Date) {
            result[key] = param.toISOString();
            return;
        }
        if (param instanceof Object &&
            !Array.isArray(param) &&
            arg &&
            arg.type.kind === "INPUT_OBJECT") {
            var args = introspectionResults.types.find(function (item) { return item.kind === arg.type.kind && item.name === arg.type.name; }).inputFields;
            result[key] = prepareParams(param, { args: args }, introspectionResults);
            return;
        }
        if (param instanceof Object &&
            !(param instanceof Date) &&
            !Array.isArray(param)) {
            result[key] = prepareParams(param, queryType, introspectionResults);
            return;
        }
        if (!arg) {
            result[key] = param;
            return;
        }
        result[key] = castType(param, arg.type);
    });
    return result;
};
var buildGetListVariables = function (introspectionResults) { return function (resource, aorFetchType, params) {
    var variables = { filter: {} };
    if (params.filter) {
        variables.filter = Object.keys(params.filter).reduce(function (acc, key) {
            var _a, _b, _c, _d, _e, _f, _g;
            if (key === "ids") {
                return __assign(__assign({}, acc), { ids: params.filter[key] });
            }
            if (typeof params.filter[key] === "object") {
                var type = introspectionResults.types.find(function (t) { return t.name === resource.type.name + "Filter"; });
                var filterSome = type.inputFields.find(function (t) { return t.name === key + "_some"; });
                if (filterSome) {
                    var filter = Object.keys(params.filter[key]).reduce(function (acc, k) {
                        var _a;
                        return (__assign(__assign({}, acc), (_a = {}, _a[k + "_in"] = params.filter[key][k], _a)));
                    }, {});
                    return __assign(__assign({}, acc), (_a = {}, _a[key + "_some"] = filter, _a));
                }
            }
            var parts = key.split(".");
            if (parts.length > 1) {
                if (parts[1] === "id") {
                    var type_1 = introspectionResults.types.find(function (t) { return t.name === resource.type.name + "Filter"; });
                    var filterSome = type_1.inputFields.find(function (t) { return t.name === parts[0] + "_some"; });
                    if (filterSome) {
                        return __assign(__assign({}, acc), (_b = {}, _b[parts[0] + "_some"] = { id: params.filter[key] }, _b));
                    }
                    return __assign(__assign({}, acc), (_c = {}, _c[parts[0]] = { id: params.filter[key] }, _c));
                }
                var resourceField_1 = resource.type.fields.find(function (f) { return f.name === parts[0]; });
                var type = getFinalType(resourceField_1.type);
                return __assign(__assign({}, acc), (_d = {}, _d[key] = sanitizeValue(type, params.filter[key]), _d));
            }
            var resourceField = resource.type.fields.find(function (f) { return f.name === key; });
            if (resourceField) {
                var type_2 = getFinalType(resourceField.type);
                var isAList = isList(resourceField.type);
                if (isAList) {
                    return __assign(__assign({}, acc), (_e = {}, _e[key] = Array.isArray(params.filter[key])
                        ? params.filter[key].map(function (value) { return sanitizeValue(type_2, value); })
                        : sanitizeValue(type_2, [params.filter[key]]), _e));
                }
                return __assign(__assign({}, acc), (_f = {}, _f[key] = sanitizeValue(type_2, params.filter[key]), _f));
            }
            return __assign(__assign({}, acc), (_g = {}, _g[key] = params.filter[key], _g));
        }, {});
    }
    if (params.pagination) {
        variables.page = parseInt(params.pagination.page, 10) - 1;
        variables.perPage = parseInt(params.pagination.perPage, 10);
    }
    if (params.sort) {
        variables.sortField = params.sort.field;
        variables.sortOrder = params.sort.order;
    }
    return variables;
}; };
var buildCreateUpdateVariables = function (resource, aorFetchType, params, queryType) {
    return Object.keys(params.data).reduce(function (acc, key) {
        var _a, _b, _c;
        if (Array.isArray(params.data[key])) {
            var arg = queryType.args.find(function (a) { return a.name === key + "Ids"; });
            if (arg) {
                return __assign(__assign({}, acc), (_a = {}, _a[key + "Ids"] = params.data[key].map(function (_a) {
                    var id = _a.id;
                    return id;
                }), _a));
            }
        }
        if (typeof params.data[key] === "object") {
            var arg = queryType.args.find(function (a) { return a.name === key + "Id"; });
            if (arg) {
                return __assign(__assign({}, acc), (_b = {}, _b[key + "Id"] = params.data[key].id, _b));
            }
        }
        return __assign(__assign({}, acc), (_c = {}, _c[key] = params.data[key], _c));
    }, {});
};
export default (function (introspectionResults) { return function (resource, aorFetchType, params, queryType) {
    var _a;
    var preparedParams = prepareParams(params, queryType, introspectionResults);
    switch (aorFetchType) {
        case GET_LIST: {
            return buildGetListVariables(introspectionResults)(resource, aorFetchType, preparedParams
            // queryType
            );
        }
        case GET_MANY:
            return {
                filter: { ids: preparedParams.ids },
            };
        case GET_MANY_REFERENCE: {
            var variables = buildGetListVariables(introspectionResults)(resource, aorFetchType, preparedParams
            // queryType
            );
            variables.filter = __assign(__assign({}, variables.filter), (_a = {}, _a[preparedParams.target] = preparedParams.id, _a));
            return variables;
        }
        case GET_ONE:
        case DELETE:
            return {
                id: preparedParams.id,
            };
        case CREATE:
        case UPDATE: {
            return buildCreateUpdateVariables(resource, aorFetchType, preparedParams, queryType);
        }
    }
}; });
