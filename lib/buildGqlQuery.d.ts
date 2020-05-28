export declare const buildFragments: (introspectionResults: any) => (possibleTypes: any) => any;
export declare const buildFields: (introspectionResults: any, path?: any[]) => (fields: any) => any;
export declare const getArgType: (arg: any) => any;
export declare const buildArgs: (query: any, variables: any) => any;
export declare const buildApolloArgs: (query: any, variables: any) => any;
declare const _default: (introspectionResults: any) => (resource: any, aorFetchType: any, queryType: any, variables: any) => any;
export default _default;
