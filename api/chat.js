import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages, responseLanguage } = req.body;

    const assistantId = "asst_XXXXXXXXXXXX"; 
    // 🔴 SOSTITUISCI con il tuo vero assistant_id

    // 1️⃣ Crea thread
    const thread = await client.beta.threads.create();

    // 2️⃣ Inserisci tutti i messaggi nel thread
    for (const msg of messages) {
      await client.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content
      });
    }

    // 3️⃣ Avvia run con istruzioni lingua
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: responseLanguage === "it"
        ? "Rispondi in italiano."
        : "Reply in English."
    });

    // 4️⃣ Aspetta completamento
    let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed") {

      if (runStatus.status === "failed") {
        throw new Error("Run failed");
      }

      if (runStatus.status === "requires_action") {
        throw new Error("Tool action required but not handled.");
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // 5️⃣ Recupera messaggi thread
    const threadMessages = await client.beta.threads.messages.list(thread.id);

    // 6️⃣ Trova ultimo messaggio assistant valido
    const assistantMessages = threadMessages.data
      .filter(m => m.role === "assistant")
      .sort((a, b) => a.created_at - b.created_at);

    const lastAssistant = assistantMessages[assistantMessages.length - 1];

    let reply = "No response.";

    if (lastAssistant && lastAssistant.content) {
      const textBlock = lastAssistant.content.find(c => c.type === "text");
      if (textBlock) {
        reply = textBlock.text.value;
      }
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Assistant error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}