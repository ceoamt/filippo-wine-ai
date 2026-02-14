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

    const assistantId = "asst_e6w9f6Xntlz18jIuoCheE0uv"; 
    // ← SOSTITUISCI con il tuo vero assistant_id

    // 1️⃣ Crea un thread
    const thread = await client.beta.threads.create();

    // 2️⃣ Inserisci i messaggi nel thread
    for (const msg of messages) {
      await client.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content
      });
    }

    // 3️⃣ Avvia il run con l’assistant
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: responseLanguage === "it"
        ? "Rispondi in italiano."
        : "Reply in English."
    });

    // 4️⃣ Aspetta che finisca
    let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed") {

      if (runStatus.status === "failed") {
        throw new Error("Run failed");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // 5️⃣ Recupera i messaggi finali
    const messagesList = await client.beta.threads.messages.list(thread.id);

    const assistantMessage = messagesList.data.find(
      m => m.role === "assistant"
    );

    const reply = assistantMessage?.content[0]?.text?.value || "No response.";

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal error" });
  }
}