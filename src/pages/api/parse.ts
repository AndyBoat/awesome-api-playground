// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type Data = {
  jsonSchema: string;
  list?: any[];
};

const DemoJson = `
{
// a complete or relative url for this api
"url":"",
// the method that should request this api
"method":"GET|POST|PUT|DELETE",
// demoParams and demoBody are the params and body in the request
// if method is 'Get', demoParams will be used,
// if method is 'Post', demoBody will be used
"demoParams":{},
"demoBody":{},
// a param or body description in RJSFSchema format
"form":{}
}
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { markdown } = req.body as { markdown: string };
  const configuration = new Configuration({
    // TODO: add your own api key
    apiKey: process.env.OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `用户给出了一段描述Rest API的Markdown文本，我需要容忍其中的Markdown语法错误,将其中的每个API描述转换为JSON格式,同一个url只会构造一个JSON描述, 如下所述${DemoJson}
          其中我使用了RJSFSchema格式来描述请求参数或请求体.我会并将每个API的描述结果存储在列表中, 直接序列后返回,移除JSON中多余的空格和Tab,尽量压缩,节省字符串长度,就像是'[{"url":"https://api.example.com/echo","method":"GET","demoParams":{"id":"123","name":"John"},"demoBody":{},"form":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"}},"required":["id"]}}]'`,
        },
        //         {
        //           role: "user",
        //           content: `
        // # API Explorer
        // ## echo
        // ### url
        // https://api.example.com/echo
        // ### method
        // GET
        // ### params
        // | name | type   | required | description      |
        // | ---- | ------ | -------- | ---------------- |
        // | id   | string | true     | id of the user   |
        // | name | string | false    | name of the user |
        // ### response
        // \`\`\`json
        // {
        //   "id": "123",
        //   "name": "John"
        // }
        // \`\`\`
        // ### response
        // \`\`\`json
        // {
        //   "id": "456",
        //   "name": "Jane"
        // }
        // \`\`\`
        // `.trim(),
        //         },
        //         {
        //           role: "assistant",
        //           content:
        //             '[{"url":"https://api.example.com/echo","method":"GET","demoParams":{"id":"123","name":"John"},"demoBody":{},"form":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"}},"required":["id"]}}]',
        //         },
        { role: "user", content: markdown },
      ],
      temperature: 0.2,
      top_p: 1,
      n: 1,
      stream: false,
    });
    console.log(response.data.choices);
    res
      .status(200)
      .json({ jsonSchema: response.data.choices[0].message?.content ?? "" });
  } catch (e) {
    console.error(e);
    console.error(((e as any)?.data as any)?.error);
    return res.status(500).json({ jsonSchema: "" });
  }
}
