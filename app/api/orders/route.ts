import {NextResponse} from "next/server";
let orders:any[]=[];
export async function GET(){return NextResponse.json({orders})}
export async function POST(req:Request){const body=await req.json();const order={id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:"new",...body};orders.unshift(order);return NextResponse.json({ok:true,order},{status:201})}