"use client";

import {useParams} from "next/navigation";
import {useState} from "react";

export default function Landing(){
  const params=useParams<{slug:string}>();
  const slug=typeof params?.slug==="string"?params.slug:"";
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/orders",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        slug,
        name:f.get("name"),
        phone:f.get("phone"),
        city:f.get("city"),
        quantity:1
      })
    });
    if(r.ok)setSent(true);
    else setError("تعذر تسجيل الطلب. حاول مرة أخرى.");
  }

  return <div style={{maxWidth:620,margin:"auto",padding:24,textAlign:"center"}} dir="rtl">
    <h1>عرض خاص</h1>
    <h2>{slug.replaceAll("-"," ")}</h2>
    <p>التوصيل مجاني والدفع عند الاستلام</p>
    {sent?<h3>✅ تم تسجيل طلبك بنجاح</h3>:
      <form onSubmit={submit}>
        <input name="name" required minLength={2} placeholder="الاسم الكامل"/>
        <input name="phone" required inputMode="tel" minLength={8} placeholder="رقم الهاتف"/>
        <input name="city" required placeholder="المدينة"/>
        {error&&<p>{error}</p>}
        <button className="primary">تأكيد الطلب</button>
      </form>}
  </div>
}