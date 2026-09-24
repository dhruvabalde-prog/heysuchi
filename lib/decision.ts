export type ApprovalMode="approval"|"selected"|"direct";
export type ApprovalRuleKey="spending"|"external_messages"|"documents"|"deletion"|"travel_booking"|"research"|"code_changes";
export type ApprovalPolicy={mode:ApprovalMode;rules:Record<ApprovalRuleKey,boolean>};

const RULES:Record<ApprovalRuleKey,RegExp>={
 spending:/\b(buy|purchase|pay|payment|transfer|charge|spend)\b/i,
 external_messages:/\b(send|email|message|contact|invite|reply|publish|post)\b/i,
 documents:/\b(create|generate|sign|submit)\b.*\b(document|contract|form|file)\b/i,
 deletion:/\b(delete|remove|cancel)\b/i,
 travel_booking:/\b(book|reserve)\b.*\b(flight|hotel|train|travel|ticket)\b/i,
 research:/\b(research|investigate|compare|find)\b/i,
 code_changes:/\b(code|commit|deploy|merge|implement|modify)\b/i
};

export function approvalRule(text:string):ApprovalRuleKey|undefined {
 return (Object.keys(RULES) as ApprovalRuleKey[]).find(key=>RULES[key].test(text));
}
export function needsApproval(text:string,policy:ApprovalPolicy={mode:"approval",rules:{
 spending:true,external_messages:true,documents:true,deletion:true,travel_booking:true,research:false,code_changes:false
}}){
 const rule=approvalRule(text);
 if(policy.mode==="direct"||!rule)return {required:false};
 if(policy.mode==="selected"&&!policy.rules[rule])return {required:false,rule};
 return {required:true,rule,question:"Should Suchi proceed?",options:["Proceed","Not now"]};
}
