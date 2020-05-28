"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ra_core_1 = require("ra-core");
var sanitizeResource = function (data) {
    var result = Object.keys(data).reduce(function (acc, key) {
        var _a, _b, _c, _d, _e;
        if (key.startsWith('_')) {
            return acc;
        }
        var dataKey = data[key];
        if (dataKey === null || dataKey === undefined) {
            return acc;
        }
        if (Array.isArray(dataKey)) {
            if (typeof dataKey[0] === 'object' && dataKey[0] !== null) {
                return __assign(__assign({}, acc), (_a = {}, _a[key] = dataKey.map(sanitizeResource), _a[key + "Ids"] = dataKey.map(function (d) { return d.id; }), _a));
            }
            else {
                return __assign(__assign({}, acc), (_b = {}, _b[key] = dataKey, _b));
            }
        }
        if (typeof dataKey === 'object' && dataKey !== null) {
            return __assign(__assign(__assign({}, acc), (dataKey &&
                dataKey.id && (_c = {},
                _c[key + ".id"] = dataKey.id,
                _c))), (_d = {}, _d[key] = sanitizeResource(dataKey), _d));
        }
        return __assign(__assign({}, acc), (_e = {}, _e[key] = dataKey, _e));
    }, {});
    return result;
};
exports.default = (function (introspectionResults) { return function (aorFetchType) { return function (response) {
    var data = response.data;
    if (aorFetchType === ra_core_1.GET_LIST ||
        aorFetchType === ra_core_1.GET_MANY ||
        aorFetchType === ra_core_1.GET_MANY_REFERENCE) {
        return {
            data: response.data.items.map(sanitizeResource),
            total: response.data.total.count,
        };
    }
    return { data: sanitizeResource(data.data) };
}; }; });
