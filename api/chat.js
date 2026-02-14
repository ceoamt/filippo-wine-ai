import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1",
      
      tools: [
        {
          type: "file_search",
          vector_store_ids: ["vs_699098debb6c81919d7c0c18af8ef7cb"]
        }
      ],

      input: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const reply = response.output_text;

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal error" });
  }
}