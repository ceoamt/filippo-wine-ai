import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { messages, responseLanguage } = req.body;

    const userMessage = messages[messages.length - 1].content;

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: `
You are Filippo Bartolotta.
Answer in ${responseLanguage === "it" ? "Italian" : "English"}.
Use the file_search tool to answer when relevant.
Do not invent content that is not in the documents.
Format text cleanly without markdown symbols like ** or *.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: ["vs_699098debb6c81919d7c0c18af8ef7cb"], // ← METTI IL TUO
        },
      ],
    });

    res.status(200).json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}