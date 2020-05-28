import merge from "lodash/merge";
import pluralize from "pluralize";
import buildDataProvider from "ra-data-graphql";
import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  UPDATE,
  UPDATE_MANY,
} from "ra-core";

import defaultBuildQuery from "./buildQuery";
const defaultOptions = {
  buildQuery: defaultBuildQuery,

  introspection: {
    operationNames: {
      [GET_LIST]: (resource) => {
        const result = pluralize(camelize(resource.name));
        console.log("result", result);
        return result;
      },
      [GET_ONE]: (resource) => pluralize(camelize(resource.name)),
      [GET_MANY]: (resource) => `${pluralize(camelize(resource.name))}`,
      [GET_MANY_REFERENCE]: (resource) =>
        `${pluralize(camelize(resource.name))}`,
      [CREATE]: (resource) => `create${resource.name}`,
      [UPDATE]: (resource) => `update${resource.name}`,
      [DELETE]: (resource) => `delete${resource.name}`,
    },
    exclude: undefined,
    include: undefined,
  },
};

export const buildQuery = defaultBuildQuery;

const provider = (options) => {
  return buildDataProvider(merge({}, defaultOptions, options)).then(
    (defaultDataProvider) => {
      return (fetchType, resource, params) => {
        // This provider does not support multiple deletions so instead we send multiple DELETE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === DELETE_MANY) {
          const { ids, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(DELETE, resource, {
                id,
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc: any, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }
        // This provider does not support multiple deletions so instead we send multiple UPDATE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === UPDATE_MANY) {
          const { ids, data, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(UPDATE, resource, {
                data: {
                  id,
                  ...data,
                },
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc: any, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }

        return defaultDataProvider(fetchType, resource, params);
      };
    }
  );
};

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export const warthogProvider = provider;

export default provider;
