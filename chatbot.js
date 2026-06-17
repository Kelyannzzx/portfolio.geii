// chatbot.js — Logique du chatbot : interface + appels à la fonction serverless.

// Associer les ancres du system prompt aux vraies pages du portfolio
const CB_LINKS = {
  "#projets": "projects.html",
  "#parcours": "about.html",
  "#competences": "skills.html",
};

// Conserver l'historique de la conversation (envoyé à chaque requête)
const cbHistory = [];

// Construire l'interface et l'ajouter à la page
function cbInit() {
  // Créer le HTML du widget
  const root = document.createElement("div");
  root.innerHTML = `
    <button class="cb-launcher" aria-label="Ouvrir l'assistant">💬</button>
    <div class="cb-window" role="dialog" aria-label="Assistant du portfolio">
      <div class="cb-head">
        <span>Assistant · Kelyann</span>
        <button class="cb-close" aria-label="Fermer">✕</button>
      </div>
      <div class="cb-log"></div>
      <form class="cb-form">
        <input class="cb-input" type="text" placeholder="Posez votre question…" autocomplete="off">
        <button class="cb-send" type="submit">→</button>
      </form>
    </div>`;
  document.body.appendChild(root);

  // Récupérer les éléments utiles
  const win = root.querySelector(".cb-window");
  const log = root.querySelector(".cb-log");
  const form = root.querySelector(".cb-form");
  const input = root.querySelector(".cb-input");

  // Ouvrir / fermer la fenêtre
  root.querySelector(".cb-launcher").addEventListener("click", () => win.classList.toggle("cb-open"));
  root.querySelector(".cb-close").addEventListener("click", () => win.classList.remove("cb-open"));

  // Afficher un message d'accueil
  cbAppend(log, "bot", "Bonjour 👋 Posez-moi une question sur le profil, les projets ou les compétences de Kelyann.");

  // Gérer l'envoi du formulaire
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    cbSend(text, log, form);
  });
}

// Ajouter une bulle dans le journal et faire défiler vers le bas
function cbAppend(log, who, text) {
  const div = document.createElement("div");
  div.className = "cb-msg " + (who === "user" ? "cb-user" : "cb-bot");
  div.innerHTML = cbFormat(text);
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

// Convertir [texte](#ancre) en vrai lien cliquable vers la bonne page
function cbFormat(text) {
  return text
    .replace(/</g, "&lt;") // échapper le HTML par sécurité
    .replace(/\[([^\]]+)\]\((#?[^)]+)\)/g, (_, label, href) => {
      const url = CB_LINKS[href] || href; // mapper l'ancre vers la page réelle
      return `<a href="${url}">${label}</a>`;
    });
}

// Envoyer le message au backend et afficher la réponse
async function cbSend(text, log, form) {
  // Afficher le message de l'utilisateur
  cbAppend(log, "user", text);
  cbHistory.push({ role: "user", content: text });

  // Désactiver le bouton et montrer un indicateur d'attente
  const btn = form.querySelector(".cb-send");
  btn.disabled = true;
  const pending = cbAppend(log, "bot", "…");

  try {
    // Appeler le backend (qui détient la clé API)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: cbHistory }),
    });
    const data = await res.json();
    const reply = data.reply || "Désolé, une erreur est survenue.";

    // Remplacer l'indicateur par la vraie réponse
    pending.innerHTML = cbFormat(reply);
    cbHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    // Afficher un message d'erreur lisible
    pending.textContent = "Connexion impossible. Réessayez plus tard.";
  } finally {
    // Réactiver le bouton et faire défiler
    btn.disabled = false;
    log.scrollTop = log.scrollHeight;
  }
}

// Lancer le chatbot au chargement de la page
document.addEventListener("DOMContentLoaded", cbInit);
