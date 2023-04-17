// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type Data = {
  jsonSchema: string;
  list?: any[];
};

const JSON_Demo = `
{
  "url":"https://exmaple.com/hello",
  "method":"GET",
  // demoParams and demoBody are the params and body in the request
  // if method is 'Get', demoParams will be used,
  // if method is 'Post', demoBody will be used
  "demoParams":{
    "name":"hello",
    "age":18
  },
  "demoBody":{
    "name":"hello",
    "age":18
  },
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
    apiKey: "",
  });
  const openai = new OpenAIApi(configuration);
  const prompt = `Please read the markdown following and directly generate a JSON Schema in formate like:
\`\`\`json
  ${JSON_Demo}
\`\`\`
  , the markdown is:
\`\`\`maerkdown
  ${markdown}
\`\`\`
`;
  const prompt2 = `Please summarize this markdown content :
  , the markdown is:
\`\`\`maerkdown
  ${markdown}
\`\`\`
`;

  const prompt3 = `Please get the result of 2+2 `;

  // const response = await openai.listModels();
  // console.info("resp", response);
  // res.status(200).json({ jsonSchema: "", list: response.data.data });
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1024,
      // temperature: 0.9,
      top_p: 1,
      n: 1,
      stream: false,
    });
    console.log(response.data.choices);
    res
      .status(200)
      .json({ jsonSchema: response.data.choices[0].text?.trim() ?? "" });
  } catch (e) {
    console.error(e);
    console.error(((e as any)?.data as any)?.error);
    return res.status(500).json({ jsonSchema: "" });
  }
}
