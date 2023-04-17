import Head from "next/head";
import styles from "@/styles/Home.module.css";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { json, jsonLanguage } from "@codemirror/lang-json";
import { languages } from "@codemirror/language-data";
import { useState } from "react";

//NOTE: a demo markdown to describe a mock API, with param and response
const demoAPIMarkdown = `
# API Explorer
## url
https://api.example.com

## method
GET

## params
| name | type | required | description |
| --- | --- | --- | --- |
| id | string | true | id of the user |
| name | string | false | name of the user |

## response
\`\`\`json
{
  "id": "123",
  "name": "John"
}
\`\`\

## response
\`\`\`json
{
  "id": "456",
  "name": "Jane"
}
\`\`\

`;

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState(demoAPIMarkdown);
  const [jsonContent, setJsonContent] = useState("");

  const onClick = () => {
    fetch("/api/parse", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        markdown: markdownContent,
      }),
    }).then(res=>res.json()).then(res=>{
      setJsonContent(res.jsonSchema)
    });
  };
  return (
    <>
      <Head>
        <title>Create And Load API Explorer!</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <CodeMirror
            theme={"dark"}
            value={markdownContent}
            extensions={[
              markdown({ base: markdownLanguage, codeLanguages: languages }),
            ]}
          ></CodeMirror>
          <button onClick={onClick}>Parse</button>
          <CodeMirror
            theme={"dark"}
            value={jsonContent}
            extensions={[json()]}
          ></CodeMirror>
        </div>
      </main>
    </>
  );
}
