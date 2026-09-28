import StoreBuilderClient from "./StoreBuilderClient";
export default async function StoreBuilderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StoreBuilderClient storeId={id}/>}
