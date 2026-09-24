import { google } from "googleapis";

const scopes=["openid","email","profile"];

export function googleOAuthClient(){
 const clientId=process.env.GOOGLE_CLIENT_ID;
 const clientSecret=process.env.GOOGLE_CLIENT_SECRET;
 const redirectUri=process.env.GOOGLE_REDIRECT_URI;
 if(!clientId||!clientSecret||!redirectUri) throw new Error("Google OAuth is not configured.");
 return new google.auth.OAuth2(clientId,clientSecret,redirectUri);
}
export function googleAuthUrl(state:string){
 const client=googleOAuthClient();
 return client.generateAuthUrl({access_type:"offline",scope:scopes,include_granted_scopes:true,state,prompt:"select_account"});
}
export async function exchangeGoogleCode(code:string){
 const client=googleOAuthClient();
 const {tokens}=await client.getToken(code);
 client.setCredentials(tokens);
 const oauth2=google.oauth2({version:"v2",auth:client});
 const {data}=await oauth2.userinfo.get();
 if(!data.id||!data.email) throw new Error("Google account did not return a usable identity.");
 return {googleId:data.id,email:data.email,name:data.name??"",picture:data.picture??"",tokens};
}
