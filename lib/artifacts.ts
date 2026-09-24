export type ArtifactInput={name:string;kind:string;title:string;summary:string;content:string};
export function normalizeArtifact(input:ArtifactInput):ArtifactInput {
 const name=input.name.trim().replace(/[^a-zA-Z0-9._-]/g,"-").slice(0,120)||"mission.md";
 return {...input,name,content:input.content.trim()};
}
export function artifactMarkdown(input:ArtifactInput){const a=normalizeArtifact(input);return "# "+a.title+"\n\n"+a.summary+"\n\n"+a.content;}
