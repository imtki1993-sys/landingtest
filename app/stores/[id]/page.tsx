import StoreBuilderLoader from "./StoreBuilderLoader";
export const dynamic="force-dynamic";
export default async function StoreBuilderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StoreBuilderLoader storeId={id}/>}
