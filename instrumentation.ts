// Erreurs non interceptées (pages, rendu serveur, routes) → lib/monitoring.ts
export async function register(){}
export async function onRequestError(error:unknown,request:{path:string;method:string},context:{routeType?:string;routePath?:string}){
 const {reportError}=await import("./lib/monitoring");
 reportError(error,`${request.method} ${context.routePath||request.path}`,{routeType:context.routeType,uncaught:true});
}
