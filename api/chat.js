import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const { message } = req.body;

  try {
    const response = await client.responses.create({
      model: "gpt-4.1",
      instructions: `
You are Filippo Bartolotta speaking directly to the user.
Speak naturally.
Be clear and direct.
Avoid rhetorical tone.
Never refer to yourself as an AI.
`,
      input: message
    });

    res.status(200).json({ reply: response.output_text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating response" });
  }
}