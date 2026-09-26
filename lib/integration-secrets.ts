import {createCipheriv,createDecipheriv,createHash,randomBytes} from "crypto";

function key(){
 const raw=process.env.INTEGRATION_ENCRYPTION_KEY;
 if(!raw)throw new Error("integration_encryption_key_not_configured");
 return createHash("sha256").update(raw).digest();
}
export function encryptIntegrationSecret(value:string){
 if(!value)return null;
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key(),iv);
 const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
 const tag=cipher.getAuthTag();
 return "v1:"+Buffer.concat([iv,tag,encrypted]).toString("base64");
}
export function decryptIntegrationSecret(value?:string|null){
 if(!value)return null;
 if(!value.startsWith("v1:"))throw new Error("integration_secret_legacy_format");
 const raw=Buffer.from(value.slice(3),"base64"),iv=raw.subarray(0,12),tag=raw.subarray(12,28),encrypted=raw.subarray(28);
 const decipher=createDecipheriv("aes-256-gcm",key(),iv);decipher.setAuthTag(tag);
 return Buffer.concat([decipher.update(encrypted),decipher.final()]).toString("utf8");
}
