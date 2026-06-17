// netlify/functions/chat.js — Fonction Netlify : proxy sécurisé navigateur → Claude.
// La clé API reste côté serveur (variable d'environnement Netlify), jamais exposée.

import Anthropic from "@anthropic-ai/sdk";

// Initialiser le client avec la clé stockée dans Netlify
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Choisir le modèle : Haiku 4.5 = rapide et économique.
// Remplacer par "claude-opus-4-8" (plus puissant) ou "claude-sonnet-4-6" (équilibré).
const MODEL = "claude-haiku-4-5";

// Définir le rôle de l'IA (System Prompt)
const SYSTEM_PROMPT =
  "Tu es l'assistant de mon portfolio. Tu réponds aux questions sur mon profil " +
  "(étudiant en BUT GEII, électronique, systèmes embarqués, projet de Kart à Hélice). " +
  "Tu dois être concis. Si on te parle de projets, tu dois inclure un lien cliquable vers '#projets'. " +
  "Si on parle de mon parcours, un lien vers '#parcours'. " +
  "Si on parle de compétences, un lien vers '#competences'.";

// Gérer la requête entrante (Netlify : event.httpMethod / event.body)
export const handler = async (event) => {
  // Refuser toute méthode autre que POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  try {
    // Lire l'historique envoyé par le front (event.body est une chaîne)
    const { messages } = JSON.parse(event.body || "{}");

    // Appeler l'API Claude avec le system prompt et l'historique
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages, // tableau [{ role: "user" | "assistant", content: "..." }]
    });

    // Extraire le texte de la réponse
    const reply = response.content.find((b) => b.type === "text")?.text ?? "";

    // Renvoyer la réponse au navigateur
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    // Tracer l'erreur côté serveur, renvoyer un message générique
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur du serveur IA" }) };
  }
};
