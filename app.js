(function () {
  "use strict";

  var STORAGE_KEY = "adi_store_v2";
  var templates = JSON.parse(document.getElementById("export-templates").textContent);

  var PALETTE = [
    { color: "#00ACB0", tint: "#DFF3F3" },
    { color: "#002743", tint: "#DCE6EE" },
    { color: "#00777A", tint: "#DCF1F1" },
    { color: "#B58200", tint: "#FEF3D5" },
    { color: "#E62460", tint: "#FDE4EB" },
    { color: "#5B7789", tint: "#E4EAEF" }
  ];
  var BG_PALETTE = ["#EEF2F5", "#FDF8F0", "#FBF1E3", "#FAEBDD", "#FDEEE0", "#F6EDE4"];
  var ICON_OPTIONS = ["wifi", "power", "slow", "screen", "print", "lock", "sound", "virus", "update", "mail", "phone", "file", "question"];
  var ICON_LABELS = { wifi: "Wi-Fi", power: "Alimentation", slow: "Lenteur", screen: "Écran", print: "Imprimante", lock: "Mot de passe", sound: "Son", virus: "Sécurité", update: "Mise à jour", mail: "E-mail", phone: "Téléphone", file: "Fichier", question: "Général" };
  // Plus de "types" imposés : une étape est neutre. Elle devient une fin
  // simplement parce qu'elle n'a aucune réponse — pas par une étiquette.

  function uid() { return Math.random().toString(36).slice(2, 9); }
  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function svgIcon(key, size) {
    size = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[key] || "") + "</svg>";
  }
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2400);
  }

  // ---------- Store ----------
  function defaultSettings() {
    return { orgName: "Mon espace", phone: "", accentColor: "#00ACB0", bgColor: "#EEF2F5", textSize: "normal", trackingSnippet: "", tutorialSeen: false };
  }
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        s.settings = Object.assign(defaultSettings(), s.settings || {});
        s.trees = s.trees || {};
        s.portals = s.portals || {};
        s.media = s.media || {};
        return s;
      }
    } catch (e) {}
    return { settings: defaultSettings(), trees: {}, portals: {}, media: {} };
  }
  function saveStore() { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }

  var store = loadStore();

  var appState = {
    screen: "dash",
    activeTreeId: null,
    activePortalId: null,
    selectedNodeId: null,
    editorLayout: "v",
    editorZoom: 1,
    editorPan: { x: 40, y: 40 },
    mediaFilter: "Tout",
    portalHomeId: null,
    apercuTreeId: null,
    apercuMode: "A",
    publishPortalId: null
  };

  // ---------- Tree / Portal helpers ----------
  function newTree() {
    var id = uid();
    var startId = uid();
    var pal = PALETTE[Object.keys(store.trees).length % PALETTE.length];
    store.trees[id] = {
      id: id, title: "Nouvel arbre", description: "", status: "brouillon",
      icon: "question", color: pal.color, tint: pal.tint,
      startId: startId, order: [startId], nodePos: {},
      nodes: { }
    };
    store.trees[id].nodes[startId] = { title: "Première question", name: "", text: "Décrivez la première question posée à la personne.", quote: "", media: null, showCallButton: false, done: false, options: [] };
    saveStore();
    return id;
  }
  function createExampleTree() {
    function node(title, text, o) {
      o = o || {};
      return { title: title, name: o.name || "", text: text, quote: o.quote || "", media: o.media || null, showCallButton: !!o.showCallButton, done: !!o.done, options: o.options || [] };
    }
    function mkTree(title, description, icon, color, tint, startId, order, nodes) {
      var id = uid();
      store.trees[id] = { id: id, title: title, description: description, status: "brouillon", icon: icon, color: color, tint: tint, startId: startId, order: order, nodePos: {}, nodes: nodes };
      return id;
    }
    function mkPortal(name, tagline, intro, slug, icon, color, tint, treeIds) {
      var id = uid();
      store.portals[id] = { id: id, name: name, tagline: tagline, intro: intro, slug: slug, icon: icon, color: color, tint: tint, mode: "A", treeIds: treeIds, lastExportAt: null };
      return id;
    }

    // ---- Arbre 1 : Pas de connexion Internet / Wi-Fi ----
    var w_q1 = uid(), w_e1a = uid(), w_e1b = uid(), w_q2 = uid(), w_e2a = uid(), w_ok = uid(), w_contact = uid();
    var treeWifi = mkTree(
      "Pas de connexion Internet", "Vérifier la box, le réseau et le mot de passe, étape par étape.",
      "wifi", "#00ACB0", "#DFF3F3", w_q1, [w_q1, w_e1a, w_e1b, w_q2, w_e2a, w_ok, w_contact],
      (function () {
        var o = {};
        o[w_q1] = node("Le voyant Wi-Fi de la box est-il allumé ?", "Regardez à l\u2019avant de la box Internet : voyant vert ou bleu, en forme d\u2019ondes.", { options: [{ target: w_e1a, label: "Oui, il est allumé" }, { target: w_e1b, label: "Non, rien ne s\u2019allume" }] });
        o[w_e1a] = node("Vérifiez que le Wi-Fi est activé sur l\u2019appareil", "Ouvrez les réglages réseau et assurez-vous que le Wi-Fi n\u2019est pas coupé (mode avion, interrupteur physique...).", { options: [{ target: w_q2, label: "C\u2019est activé, mais toujours rien" }] });
        o[w_e1b] = node("Rebranchez l\u2019alimentation de la box", "Débranchez le câble d\u2019alimentation, attendez dix secondes, puis rebranchez-le fermement.", { quote: "Patientez ensuite deux minutes que la box redémarre complètement.", options: [{ target: w_ok, label: "Ça remarche !" }, { target: w_contact, label: "Toujours rien après 2 minutes" }] });
        o[w_q2] = node("Voyez-vous le réseau Wi-Fi dans la liste des réseaux disponibles ?", "Ouvrez les réglages Wi-Fi de votre ordinateur ou de votre téléphone.", { options: [{ target: w_e2a, label: "Oui, je le vois" }, { target: w_contact, label: "Non, aucun réseau visible" }] });
        o[w_e2a] = node("Saisissez le mot de passe Wi-Fi", "Le mot de passe est généralement inscrit sur une étiquette collée sous ou derrière la box.", { options: [{ target: w_ok, label: "Connexion réussie" }, { target: w_contact, label: "Le mot de passe est refusé" }] });
        o[w_ok] = node("Connexion rétablie", "La connexion Internet devrait maintenant fonctionner normalement.", { done: true });
        o[w_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    // ---- Arbre 2 : Imprimante qui ne répond pas ----
    var p_q1 = uid(), p_e1 = uid(), p_e2 = uid(), p_e3 = uid(), p_ok = uid(), p_contact = uid();
    var treePrint = mkTree(
      "Imprimante qui ne répond pas", "Diagnostiquer une imprimante qui n\u2019imprime plus.",
      "print", "#B58200", "#FEF3D5", p_q1, [p_q1, p_e1, p_e2, p_e3, p_ok, p_contact],
      (function () {
        var o = {};
        o[p_q1] = node("L\u2019imprimante est-elle allumée avec un voyant vert fixe ?", "Regardez l\u2019écran ou le voyant d\u2019état sur l\u2019imprimante.", { options: [{ target: p_e1, label: "Oui, tout est vert" }, { target: p_e2, label: "Non, voyant orange, rouge ou éteint" }] });
        o[p_e1] = node("Vérifiez la connexion USB ou Wi-Fi", "Assurez-vous que le câble USB est bien branché, ou que l\u2019imprimante est sur le même réseau Wi-Fi que votre ordinateur.", { options: [{ target: p_e3, label: "C\u2019est bien connecté" }] });
        o[p_e2] = node("Vérifiez le bac à papier et les cartouches", "Ouvrez le capot : contrôlez qu\u2019il y a du papier, que les cartouches sont bien enclenchées et qu\u2019aucun bourrage n\u2019est visible.", { quote: "Un voyant orange clignotant signale le plus souvent un bourrage papier ou un niveau d\u2019encre bas.", options: [{ target: p_e3, label: "C\u2019est résolu" }, { target: p_contact, label: "Le problème persiste" }] });
        o[p_e3] = node("Relancez une impression test", "Imprimez une page de test depuis les réglages de votre ordinateur ou de votre téléphone.", { options: [{ target: p_ok, label: "L\u2019impression fonctionne" }, { target: p_contact, label: "Toujours aucune impression" }] });
        o[p_ok] = node("Imprimante opérationnelle", "Votre imprimante fonctionne à nouveau normalement.", { done: true });
        o[p_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    // ---- Arbre 3 : Mot de passe oublié ----
    var m_q1 = uid(), m_e1 = uid(), m_e2 = uid(), m_ok = uid(), m_contact = uid();
    var treePassword = mkTree(
      "Mot de passe oublié", "Retrouver l\u2019accès à sa session ou à un compte en ligne.",
      "lock", "#5B7789", "#E4EAEF", m_q1, [m_q1, m_e1, m_e2, m_ok, m_contact],
      (function () {
        var o = {};
        o[m_q1] = node("S\u2019agit-il du mot de passe de votre ordinateur, ou d\u2019un site / application ?", "Précisez d\u2019abord de quel mot de passe il s\u2019agit : ça change la marche à suivre.", { options: [{ target: m_e1, label: "Ma session d\u2019ordinateur" }, { target: m_e2, label: "Un site ou une application" }] });
        o[m_e1] = node("Utilisez un compte administrateur pour le réinitialiser", "Connectez-vous avec un autre compte administrateur, puis allez dans les réglages de comptes pour réinitialiser le mot de passe.", { options: [{ target: m_ok, label: "C\u2019est réinitialisé" }, { target: m_contact, label: "Je n\u2019ai pas de compte administrateur" }] });
        o[m_e2] = node("Utilisez le lien \u00ab mot de passe oublié \u00bb du site", "Sur la page de connexion, cliquez sur \u00ab mot de passe oublié \u00bb et suivez les instructions reçues par e-mail.", { quote: "Pensez à vérifier vos courriers indésirables si l\u2019e-mail n\u2019arrive pas tout de suite.", options: [{ target: m_ok, label: "J\u2019ai réinitialisé" }, { target: m_contact, label: "Je ne reçois aucun e-mail" }] });
        o[m_ok] = node("Mot de passe réinitialisé", "Vous pouvez maintenant vous reconnecter avec votre nouveau mot de passe.", { done: true });
        o[m_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    var portalAssistance = mkPortal(
      "Assistance informatique", "Comment pouvons-nous vous aider ?",
      "Choisissez la situation qui ressemble le plus à la vôtre. Chaque parcours vous guide pas à pas.",
      "assistance", "grid", "#00ACB0", "#DFF3F3", [treeWifi, treePrint, treePassword]
    );

    // ---- Arbre 4 : Écran noir après mise à jour (Linux, simple) ----
    var s_q1 = uid(), s_e1 = uid(), s_e2 = uid(), s_ok = uid(), s_contact = uid();
    var treeScreen = mkTree(
      "Écran noir après une mise à jour", "Retrouver un affichage normal après une mise à jour système.",
      "screen", "#002743", "#DCE6EE", s_q1, [s_q1, s_e1, s_e2, s_ok, s_contact],
      (function () {
        var o = {};
        o[s_q1] = node("L\u2019écran est-il resté noir plus de cinq minutes ?", "Un écran noir juste après une mise à jour peut simplement prendre un peu de temps à revenir.", { options: [{ target: s_e1, label: "Oui, ça fait plus de cinq minutes" }, { target: s_e2, label: "Non, ça vient de se produire" }] });
        o[s_e1] = node("Forcez le redémarrage de l\u2019ordinateur", "Maintenez le bouton d\u2019allumage enfoncé quelques secondes jusqu\u2019à ce que l\u2019ordinateur s\u2019éteigne, puis rallumez-le normalement.", { options: [{ target: s_ok, label: "L\u2019écran est revenu" }, { target: s_contact, label: "Toujours noir" }] });
        o[s_e2] = node("Patientez encore quelques minutes", "Évitez d\u2019éteindre l\u2019ordinateur pendant ce temps : la mise à jour se termine peut-être en arrière-plan.", { options: [{ target: s_ok, label: "L\u2019écran est revenu" }, { target: s_contact, label: "Toujours noir après l\u2019attente" }] });
        o[s_ok] = node("Affichage rétabli", "L\u2019écran fonctionne à nouveau normalement.", { done: true });
        o[s_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    // ---- Arbre 5 : Wi-Fi qui ne se connecte plus (Linux, simple) ----
    var l_q1 = uid(), l_e1 = uid(), l_e2 = uid(), l_ok = uid(), l_contact = uid();
    var treeLinuxWifi = mkTree(
      "Le Wi-Fi ne se connecte plus", "Retrouver une connexion Wi-Fi qui ne fonctionne plus.",
      "wifi", "#00777A", "#DCF1F1", l_q1, [l_q1, l_e1, l_e2, l_ok, l_contact],
      (function () {
        var o = {};
        o[l_q1] = node("Y a-t-il un petit interrupteur ou une touche Wi-Fi sur l\u2019ordinateur ?", "Certains ordinateurs portables ont un interrupteur physique ou une touche (souvent avec une icône d\u2019antenne) qui coupe le Wi-Fi.", { options: [{ target: l_e1, label: "Oui, je vais vérifier" }, { target: l_e2, label: "Non / je ne sais pas" }] });
        o[l_e1] = node("Assurez-vous qu\u2019il est bien activé", "Appuyez sur l\u2019interrupteur ou la touche pour vérifier qu\u2019il n\u2019est pas resté en position \u00ab éteint \u00bb.", { options: [{ target: l_ok, label: "Ça fonctionne" }, { target: l_e2, label: "Toujours rien" }] });
        o[l_e2] = node("Redémarrez l\u2019ordinateur et la box Internet", "Éteignez complètement l\u2019ordinateur, débranchez la box quelques secondes, puis rallumez les deux.", { options: [{ target: l_ok, label: "Ça fonctionne" }, { target: l_contact, label: "Toujours pas de connexion" }] });
        o[l_ok] = node("Wi-Fi opérationnel", "La connexion Wi-Fi fonctionne à nouveau normalement.", { done: true });
        o[l_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    // ---- Arbre 6 : Le son ne fonctionne plus (Linux, simple) ----
    var d_q1 = uid(), d_e1 = uid(), d_e2 = uid(), d_ok = uid(), d_contact = uid();
    var treeSound = mkTree(
      "Le son ne fonctionne plus", "Retrouver le son sur un ordinateur qui n\u2019émet plus aucun bruit.",
      "sound", "#5B7789", "#E4EAEF", d_q1, [d_q1, d_e1, d_e2, d_ok, d_contact],
      (function () {
        var o = {};
        o[d_q1] = node("Le volume est-il bien monté et non coupé ?", "Regardez l\u2019icône de son en bas de l\u2019écran : vérifiez qu\u2019elle n\u2019est pas barrée et que le curseur n\u2019est pas au minimum.", { options: [{ target: d_ok, label: "C\u2019était ça, ça fonctionne" }, { target: d_e1, label: "Le volume était déjà correct" }] });
        o[d_e1] = node("Vérifiez les enceintes ou le casque", "Assurez-vous que le câble est bien branché, ou que le casque/l\u2019enceinte Bluetooth est bien connecté et allumé.", { options: [{ target: d_ok, label: "C\u2019est réglé" }, { target: d_e2, label: "Toujours aucun son" }] });
        o[d_e2] = node("Redémarrez l\u2019ordinateur", "Un simple redémarrage résout souvent ce type de problème.", { options: [{ target: d_ok, label: "Le son est revenu" }, { target: d_contact, label: "Toujours aucun son" }] });
        o[d_ok] = node("Son rétabli", "Le son fonctionne à nouveau normalement.", { done: true });
        o[d_contact] = node("Besoin d\u2019un technicien", "Ce problème nécessite une intervention plus poussée. Un technicien peut vous aider directement.", { showCallButton: true, done: true });
        return o;
      })()
    );

    var portalLinux = mkPortal(
      "Assistance Linux", "Un souci sous Linux ?",
      "Choisissez la situation qui ressemble le plus à la vôtre. Ces parcours couvrent les cas les plus fréquents, sans compétence technique requise.",
      "linux", "wifi", "#00777A", "#DCF1F1", [treeScreen, treeLinuxWifi, treeSound]
    );

    // ---- Arbre 7 : à qui s'adresser pour une commande de matériel (routage régional) ----
    var r_q1 = uid(), r_q2 = uid(), r_idf = uid(), r_ara = uid(), r_autre = uid(), r_suivi = uid(), r_divers = uid();
    var treeRouting = mkTree(
      "À qui s\u2019adresser pour une commande de matériel ?", "Oriente vers le bon interlocuteur selon la région et le type de demande.",
      "mail", "#E62460", "#FDE4EB", r_q1, [r_q1, r_q2, r_idf, r_ara, r_autre, r_suivi, r_divers],
      (function () {
        var o = {};
        o[r_q1] = node("Quel est l\u2019objet de votre demande ?", "Choisissez la situation qui correspond le mieux.", { options: [{ target: r_q2, label: "Nouvelle commande de matériel" }, { target: r_suivi, label: "Suivi d\u2019une commande existante" }, { target: r_divers, label: "Autre demande" }] });
        o[r_q2] = node("Dans quelle région se situe votre structure ?", "Cela détermine le référent matériel à contacter.", { options: [{ target: r_idf, label: "Île-de-France" }, { target: r_ara, label: "Auvergne-Rhône-Alpes" }, { target: r_autre, label: "Une autre région" }] });
        o[r_idf] = node("Référent Île-de-France", "Le référent matériel pour l\u2019Île-de-France est joignable à referent-idf@exemple.org, avec le nom de votre structure et le matériel souhaité.", { done: true });
        o[r_ara] = node("Référent Auvergne-Rhône-Alpes", "Le référent matériel pour l\u2019Auvergne-Rhône-Alpes est joignable à referent-ara@exemple.org, avec le nom de votre structure et le matériel souhaité.", { done: true });
        o[r_autre] = node("Coordination nationale", "Pour toute autre région, la coordination nationale se charge de vous orienter : contact@exemple.org.", { done: true });
        o[r_suivi] = node("Suivi de commande", "Indiquez votre numéro de commande à suivi-commandes@exemple.org : un accusé de réception vous sera envoyé sous 48h.", { done: true });
        o[r_divers] = node("Autre demande", "Décrivez votre besoin par mail à contact@exemple.org : votre message sera redirigé vers la bonne personne.", { done: true });
        return o;
      })()
    );

    var portalRouting = mkPortal(
      "Commandes matériel", "À qui s\u2019adresser ?",
      "Selon votre région et votre demande, ce portail vous oriente directement vers le bon interlocuteur.",
      "commandes", "mail", "#E62460", "#FDE4EB", [treeRouting]
    );

    saveStore();
    return { treeId: treeWifi, portalId: portalAssistance, portals: [portalAssistance, portalLinux, portalRouting] };
  }
  function deleteTree(id) {
    if (!confirm("Supprimer cet arbre ? Cette action est définitive.")) return;
    delete store.trees[id];
    Object.values(store.portals).forEach(function (p) { p.treeIds = p.treeIds.filter(function (t) { return t !== id; }); });
    saveStore();
    if (appState.activeTreeId === id) appState.activeTreeId = null;
    render();
  }
  function addBranch(tree, fromNodeId) {
    var id = uid();
    tree.nodes[id] = { title: "Nouvelle étape", name: "", text: "Décrivez cette étape.", quote: "", media: null, showCallButton: false, done: false, options: [] };
    tree.order.push(id);
    tree.nodes[fromNodeId].options.push({ target: id, label: "" });
    saveStore();
    appState.selectedNodeId = id;
  }
  function deleteNode(tree, nodeId) {
    if (tree.order.length <= 1 || nodeId === tree.startId) return;
    if (!confirm("Supprimer cette étape et ses réponses associées ?")) return;
    tree.order = tree.order.filter(function (i) { return i !== nodeId; });
    delete tree.nodes[nodeId];
    if (tree.nodePos) delete tree.nodePos[nodeId];
    tree.order.forEach(function (i) {
      tree.nodes[i].options = tree.nodes[i].options.filter(function (o) { return o.target !== nodeId; });
    });
    saveStore();
    appState.selectedNodeId = tree.startId;
  }

  function newPortal() {
    var id = uid();
    var pal = PALETTE[Object.keys(store.portals).length % PALETTE.length];
    store.portals[id] = {
      id: id, name: "Nouveau portail", tagline: "Quel est votre problème aujourd'hui ?",
      intro: "Choisissez la situation qui ressemble le plus à la vôtre.",
      slug: "portail-" + id, icon: "grid", color: pal.color, tint: pal.tint,
      mode: "A", treeIds: [], lastExportAt: null
    };
    saveStore();
    return id;
  }
  function deletePortal(id) {
    if (!confirm("Supprimer ce portail ?")) return;
    delete store.portals[id];
    saveStore();
    if (appState.activePortalId === id) appState.activePortalId = null;
    render();
  }

  function addMediaFromFile(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var id = uid();
      store.media[id] = {
        id: id, name: file.name, type: "image", url: reader.result,
        meta: Math.round(file.size / 1024) + " Ko", createdAt: Date.now()
      };
      saveStore();
      cb && cb(id);
    };
    reader.readAsDataURL(file);
  }
  function addMediaFromUrl(url, name) {
    var id = uid();
    store.media[id] = { id: id, name: name || "Vidéo en ligne", type: "video", url: url, meta: "Lien vidéo", createdAt: Date.now() };
    saveStore();
    return id;
  }

  // ---------- Navigation ----------
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { setScreen(btn.dataset.screen); });
  });
  function setScreen(name) {
    appState.screen = name;
    document.querySelectorAll(".nav-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.screen === name); });
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("visible"); });
    document.getElementById("screen-" + name).classList.add("visible");
    render();
  }

  function render() {
    renderSidebarFooter();
    var s = appState.screen;
    if (s === "dash") renderDash();
    else if (s === "editor") renderEditor();
    else if (s === "media") renderMedia();
    else if (s === "portals") renderPortals();
    else if (s === "portalHome") renderPortalHome();
    else if (s === "apercu") renderApercu();
    else if (s === "publish") renderPublish();
    else if (s === "settings") renderSettings();
    else if (s === "stats") renderStats();
  }

  function renderSidebarFooter() {
    document.getElementById("sidebar-org").textContent = store.settings.orgName || "Mon espace";
    document.getElementById("sidebar-badge").style.background = store.settings.accentColor || "#00ACB0";
    var nTrees = Object.keys(store.trees).length;
    var nPortals = Object.keys(store.portals).length;
    document.getElementById("sidebar-footer").innerHTML =
      "<strong>" + nTrees + "</strong> arbre" + (nTrees > 1 ? "s" : "") + " · <strong>" + nPortals + "</strong> portail" + (nPortals > 1 ? "s" : "");
  }

  // ---------- Dashboard ----------
  function renderDash() {
    var trees = Object.values(store.trees);
    var published = trees.filter(function (t) { return t.status === "publie"; }).length;
    var stepsTotal = trees.reduce(function (a, t) { return a + t.order.length; }, 0);
    var stats = [
      { label: "Arbres publiés", value: published },
      { label: "Étapes rédigées", value: stepsTotal },
      { label: "Portails créés", value: Object.keys(store.portals).length },
      { label: "Médias enregistrés", value: Object.keys(store.media).length }
    ];
    document.getElementById("dash-stats").innerHTML = stats.map(function (s) {
      return '<div class="stat-card"><div class="label">' + s.label + '</div><div class="value">' + s.value + "</div></div>";
    }).join("");

    var grid = document.getElementById("dash-trees");
    if (!trees.length) {
      grid.innerHTML = '<p class="empty-hint">Aucun arbre pour l\u2019instant. Créez-en un pour commencer.</p>';
    } else {
      grid.innerHTML = trees.map(function (t) {
        var badge = t.status === "publie" ? ["Publié", "#DCF1F1", "#00777A"] : t.status === "relecture" ? ["Relecture", "#FEF3D5", "#B58200"] : ["Brouillon", "#E4EAEF", "#5B7789"];
        var portalCount = Object.values(store.portals).filter(function (p) { return p.treeIds.indexOf(t.id) > -1; }).length;
        return '<div class="entity-card" data-tree="' + t.id + '">' +
          '<div class="entity-card-top"><div class="entity-icon" style="background:' + t.tint + ';color:' + t.color + ';">' + svgIcon(t.icon, 22) + '</div>' +
          '<span style="display:flex;align-items:center;gap:8px;"><span class="badge" style="background:' + badge[1] + ';color:' + badge[2] + ';">' + badge[0] + '</span>' +
          '<button type="button" class="del-x" data-del-tree="' + t.id + '" title="Supprimer l\u2019arbre">\u2715</button></span></div>' +
          '<div><div class="entity-title">' + escapeHtml(t.title) + '</div><div class="entity-desc">' + escapeHtml(t.description || "Aucune description.") + '</div></div>' +
          '<div class="entity-foot"><span>' + t.order.length + ' étapes</span><span>' + portalCount + ' portail' + (portalCount > 1 ? "s" : "") + '</span></div>' +
          "</div>";
      }).join("");
      grid.querySelectorAll(".entity-card").forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (e.target.closest("[data-del-tree]")) return;
          appState.activeTreeId = card.dataset.tree;
          appState.selectedNodeId = store.trees[card.dataset.tree].startId;
          setScreen("editor");
        });
      });
      grid.querySelectorAll("[data-del-tree]").forEach(function (b) {
        b.addEventListener("click", function (e) { e.stopPropagation(); deleteTree(b.dataset.delTree); });
      });
    }
  }
  document.getElementById("btn-dash-new-tree").addEventListener("click", function () {
    var id = newTree();
    appState.activeTreeId = id;
    appState.selectedNodeId = store.trees[id].startId;
    setScreen("editor");
  });

  // ---------- Editor ----------
  function layoutTree(tree, direction) {
    var order = tree.order, nodes = tree.nodes;
    var kids = {}, parent = {};
    order.forEach(function (id) { kids[id] = []; });
    order.forEach(function (id) {
      (nodes[id].options || []).forEach(function (o) {
        if (nodes[o.target] && parent[o.target] === undefined && o.target !== id) { parent[o.target] = id; kids[id].push(o.target); }
      });
    });
    var root = (tree.startId && nodes[tree.startId]) ? tree.startId : order[0];
    var depth = {};
    (function walk(id, d, seen) {
      seen = seen || {};
      if (seen[id]) return;
      seen[id] = true;
      depth[id] = Math.max(depth[id] === undefined ? -1 : depth[id], d);
      kids[id].forEach(function (k) { walk(k, d + 1, seen); });
    })(root, 0);
    order.forEach(function (id) { if (depth[id] === undefined) depth[id] = 0; });

    var cursor = 0, slot = {};
    function place(id, seen) {
      seen = seen || {};
      if (seen[id]) return slot[id] || 0;
      seen[id] = true;
      if (!kids[id].length) { slot[id] = cursor++; return slot[id]; }
      var cs = kids[id].map(function (k) { return place(k, seen); });
      slot[id] = (cs[0] + cs[cs.length - 1]) / 2;
      return slot[id];
    }
    var placedSeen = {};
    place(root, placedSeen);
    order.forEach(function (id) { if (slot[id] === undefined) place(id, placedSeen); });

    var W = 220, NH = 96, gapX = 60, gapY = 76;
    var pos = {};
    order.forEach(function (id) {
      if (direction === "v") pos[id] = { x: slot[id] * (W + gapX), y: depth[id] * (NH + gapY) };
      else pos[id] = { x: depth[id] * (W + gapX), y: slot[id] * (NH + gapY) };
    });
    var xs = Object.keys(pos).map(function (k) { return pos[k].x; });
    var ys = Object.keys(pos).map(function (k) { return pos[k].y; });
    var minX = Math.min.apply(null, xs), minY = Math.min.apply(null, ys);
    order.forEach(function (id) { pos[id].x -= minX; pos[id].y -= minY; });

    var manual = tree.nodePos || {};
    order.forEach(function (id) { if (manual[id]) pos[id] = { x: manual[id].x, y: manual[id].y }; });

    var edges = [];
    order.forEach(function (id) {
      (nodes[id].options || []).forEach(function (o) {
        if (!pos[id] || !pos[o.target]) return;
        var a = pos[id], b = pos[o.target], x1, y1, x2, y2, d;
        if (direction === "v") { x1 = a.x + W / 2; y1 = a.y + NH; x2 = b.x + W / 2; y2 = b.y; d = "M" + x1 + " " + y1 + " C " + x1 + " " + (y1 + 45) + ", " + x2 + " " + (y2 - 45) + ", " + x2 + " " + y2; }
        else { x1 = a.x + W; y1 = a.y + NH / 2; x2 = b.x; y2 = b.y + NH / 2; d = "M" + x1 + " " + y1 + " C " + (x1 + 45) + " " + y1 + ", " + (x2 - 45) + " " + y2 + ", " + x2 + " " + y2; }
        var lx = (x1 + x2) / 2, ly = (y1 + y2) / 2;
        var label = (o.label && o.label.trim()) || (nodes[o.target] && (nodes[o.target].name || nodes[o.target].title)) || "";
        var bw = Math.max(44, label.length * 6 + 16);
        edges.push({ d: d, lx: lx, ly: ly + 4, bx: lx - bw / 2, by: ly - 11, bw: bw, label: label });
      });
    });
    var allX = order.map(function (id) { return pos[id].x; });
    var allY = order.map(function (id) { return pos[id].y; });
    var canvasW = Math.max(700, Math.max.apply(null, allX) + W) + 40;
    var canvasH = Math.max(400, Math.max.apply(null, allY) + NH) + 40;
    return { pos: pos, W: W, NH: NH, edges: edges, canvasW: canvasW, canvasH: canvasH };
  }

  function renderEditor() {
    var trees = Object.values(store.trees);
    var sel = document.getElementById("editor-tree-select");
    var emptyEl = document.getElementById("canvas-empty");
    var innerEl = document.getElementById("canvas-inner");
    if (!trees.length) {
      emptyEl.hidden = false;
      emptyEl.innerHTML = 'Aucun arbre pour l\u2019instant. <button type="button" class="btn btn-primary btn-small" id="btn-canvas-new-tree" style="margin-left:8px;">+ Créer un arbre</button>';
      innerEl.style.display = "none";
      document.getElementById("node-panel").innerHTML = "";
      sel.innerHTML = "";
      document.getElementById("editor-tree-title").value = "";
      document.getElementById("editor-tree-desc").value = "";
      document.getElementById("btn-canvas-new-tree").addEventListener("click", function () {
        var id = newTree();
        appState.activeTreeId = id;
        appState.selectedNodeId = store.trees[id].startId;
        renderEditor();
      });
      return;
    }
    emptyEl.hidden = true;
    innerEl.style.display = "";
    if (!appState.activeTreeId || !store.trees[appState.activeTreeId]) appState.activeTreeId = trees[0].id;
    var tree = store.trees[appState.activeTreeId];
    if (!appState.selectedNodeId || !tree.nodes[appState.selectedNodeId]) appState.selectedNodeId = tree.startId;

    sel.innerHTML = trees.map(function (t) { return '<option value="' + t.id + '"' + (t.id === tree.id ? " selected" : "") + '>' + escapeHtml(t.title) + "</option>"; }).join("");
    sel.onchange = function () { appState.activeTreeId = sel.value; appState.selectedNodeId = store.trees[sel.value].startId; renderEditor(); };

    var titleInput = document.getElementById("editor-tree-title");
    var descInput = document.getElementById("editor-tree-desc");
    titleInput.value = tree.title;
    descInput.value = tree.description || "";
    titleInput.oninput = function (e) { tree.title = e.target.value; saveStore(); sel.options[sel.selectedIndex].textContent = e.target.value; };
    descInput.oninput = function (e) { tree.description = e.target.value; saveStore(); };

    var iconPicker = document.getElementById("editor-icon-picker");
    iconPicker.innerHTML =
      '<span class="icon-preview" style="background:' + tree.tint + ';color:' + tree.color + ';">' + svgIcon(tree.icon, 16) + '</span>' +
      '<select id="editor-icon-select">' + ICON_OPTIONS.map(function (key) {
        return '<option value="' + key + '"' + (tree.icon === key ? " selected" : "") + '>' + (ICON_LABELS[key] || key) + "</option>";
      }).join("") + "</select>";
    document.getElementById("editor-icon-select").addEventListener("change", function (e) { tree.icon = e.target.value; saveStore(); renderEditor(); renderDash(); });
    var colorPicker = document.getElementById("editor-color-picker");
    colorPicker.innerHTML = PALETTE.map(function (p) {
      return '<button type="button" class="color-pick-btn' + (tree.color === p.color ? " active" : "") + '" data-color="' + p.color + '" data-tint="' + p.tint + '" style="background:' + p.color + ';" title="Couleur"></button>';
    }).join("");
    colorPicker.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { tree.color = b.dataset.color; tree.tint = b.dataset.tint; saveStore(); renderEditor(); renderDash(); });
    });

    document.querySelectorAll("#layout-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.layout === appState.editorLayout);
      b.onclick = function () { appState.editorLayout = b.dataset.layout; renderEditor(); };
    });

    renderCanvas(tree);
    renderNodePanel(tree);
  }

  var lastCanvasTreeId = null;
  function drawEdges(svg, L) {
    svg.setAttribute("width", L.canvasW);
    svg.setAttribute("height", L.canvasH);
    svg.innerHTML = L.edges.map(function (e) {
      return '<path d="' + e.d + '" fill="none" stroke="#BFCCD6" stroke-width="2" stroke-linecap="round"></path>' +
        '<rect x="' + e.bx + '" y="' + e.by + '" width="' + e.bw + '" height="22" rx="11" fill="#FFFFFF" stroke="#D3DDE4"></rect>' +
        '<text x="' + e.lx + '" y="' + e.ly + '" text-anchor="middle" font-size="12" font-family="Atkinson Hyperlegible, sans-serif" fill="#5B7789">' + escapeHtml(e.label) + "</text>";
    }).join("");
  }

  function renderCanvas(tree) {
    if (tree.id !== lastCanvasTreeId) {
      appState.editorZoom = 1;
      appState.editorPan = { x: 40, y: 40 };
      lastCanvasTreeId = tree.id;
    }
    var L = layoutTree(tree, appState.editorLayout);
    var inner = document.getElementById("canvas-inner");
    inner.style.width = L.canvasW + "px";
    inner.style.height = L.canvasH + "px";
    applyCanvasTransform();

    var svg = document.getElementById("canvas-svg");
    if (!svg) return;
    drawEdges(svg, L);

    var nodesEl = document.getElementById("canvas-nodes");
    nodesEl.innerHTML = tree.order.map(function (id) {
      var n = tree.nodes[id];
      var p = L.pos[id];
      var isEnd = !n.options || n.options.length === 0;
      var chips = "";
      if (n.media) chips += '<span class="n-chip">' + svgIcon(n.media.type === "video" ? "vid" : "img", 13) + " Média</span>";
      if (n.quote) chips += '<span class="n-chip">' + svgIcon("quote", 13) + " Encadré</span>";
      if (isEnd) chips += '<span class="n-chip n-chip-end">' + svgIcon("check", 13) + " Fin</span>";
      var sel = id === appState.selectedNodeId;
      var borderColor = isEnd ? "#1D9A6C" : tree.color;
      var cardStyle = "left:" + p.x + "px; top:" + p.y + "px; width:" + L.W + "px;" +
        " border-left: 5px solid " + borderColor + ";" +
        " border-top-color:" + (sel ? tree.color : "#D5DEE5") + "; border-right-color:" + (sel ? tree.color : "#D5DEE5") + "; border-bottom-color:" + (sel ? tree.color : "#D5DEE5") + ";" +
        (id === tree.startId ? " background:" + tree.tint + ";" : "");
      return '<div class="tree-node' + (sel ? " selected" : "") + (n.done ? " marked-done" : "") + '" data-node="' + id + '" style="' + cardStyle + '">' +
        (n.done ? '<div class="done-badge" title="Étape terminée">' + svgIcon("check", 13) + "</div>" : "") +
        (id === tree.startId ? '<div class="n-head" style="color:' + tree.color + ';">' + svgIcon("home", 13) + '<span class="n-kind">Départ</span></div>' : "") +
        '<div class="n-title">' + escapeHtml(displayLabel(n)) + "</div>" + chips + "</div>";
    }).join("");

    nodesEl.querySelectorAll(".tree-node").forEach(function (el) {
      var nodeId = el.dataset.node;
      var drag = null;
      el.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        drag = { startX: e.clientX, startY: e.clientY, origX: L.pos[nodeId].x, origY: L.pos[nodeId].y, moved: false };
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var dx = (e.clientX - drag.startX) / appState.editorZoom;
        var dy = (e.clientY - drag.startY) / appState.editorZoom;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        drag.moved = true;
        el.classList.add("node-dragging");
        var newX = Math.max(0, drag.origX + dx);
        var newY = Math.max(0, drag.origY + dy);
        el.style.left = newX + "px";
        el.style.top = newY + "px";
        L.pos[nodeId] = { x: newX, y: newY };
        tree.nodePos = tree.nodePos || {};
        tree.nodePos[nodeId] = { x: newX, y: newY };
        var L2 = layoutTree(tree, appState.editorLayout);
        drawEdges(document.getElementById("canvas-svg"), L2);
        var innerEl = document.getElementById("canvas-inner");
        innerEl.style.width = L2.canvasW + "px";
        innerEl.style.height = L2.canvasH + "px";
      });
      el.addEventListener("pointerup", function (e) {
        el.classList.remove("node-dragging");
        if (drag && drag.moved) {
          saveStore();
          drag = null;
          return;
        }
        drag = null;
        appState.selectedNodeId = nodeId;
        renderCanvas(tree);
        renderNodePanel(tree);
      });
    });
  }

  function displayLabel(n) {
    if (!n) return "(sans titre)";
    return (n.name && n.name.trim()) ? n.name : (n.title || "(sans titre)");
  }
  function nodeOptionLabel(tree, id) {
    var n = tree.nodes[id];
    return (id === tree.startId ? "Départ · " : "") + displayLabel(n);
  }

  function findParentNodes(tree, nodeId) {
    return tree.order.filter(function (id) {
      return id !== nodeId && (tree.nodes[id].options || []).some(function (o) { return o.target === nodeId; });
    });
  }

  function renderNodePanel(tree) {
    var node = tree.nodes[appState.selectedNodeId];
    var panel = document.getElementById("node-panel");
    var canDelete = tree.order.length > 1 && appState.selectedNodeId !== tree.startId;
    var parents = findParentNodes(tree, appState.selectedNodeId);

    var mediaHtml;
    if (node.media) {
      var thumb = node.media.type === "image" ? '<img src="' + node.media.url + '" alt="">' : svgIcon("vid", 22);
      mediaHtml = '<div class="media-box"><div class="thumb">' + thumb + '</div><div class="info"><div class="name">' + escapeHtml(node.media.name) + '</div><div class="kind">' + escapeHtml(node.media.meta || "") + '</div></div>' +
        '<button type="button" class="btn btn-tint btn-small" id="btn-media-clear">Retirer</button></div>';
    } else {
      mediaHtml = '<div class="media-box"><div class="thumb">' + svgIcon("media", 22) + '</div><div class="info"><div class="name">Aucun média</div><div class="kind">Ajoutez une photo d\u2019écran ou une vidéo</div></div></div>';
    }
    var mediaLib = Object.values(store.media);

    var isEnd = !node.options || node.options.length === 0;

    panel.innerHTML =
      (parents.length ? '<div class="parent-crumb">' + parents.map(function (pid) {
        return '<button type="button" class="crumb-btn" data-goto="' + pid + '">' + svgIcon("back", 13) + ' ' + escapeHtml(displayLabel(tree.nodes[pid])) + "</button>";
      }).join("") + '<div class="field-hint" style="margin:6px 0 0;">Revenez ici pour ajouter une autre réponse à cette question.</div></div>' : "") +
      '<div class="node-panel-head"><div style="font-size:15.5px;font-weight:700;">Étape sélectionnée</div>' +
      (canDelete ? '<button type="button" class="btn btn-danger-line btn-small" id="btn-node-delete">' + svgIcon("trash", 14) + ' Supprimer</button>' : "") + "</div>" +
      '<button type="button" class="done-toggle' + (node.done ? " active" : "") + '" id="btn-toggle-done">' + svgIcon("check", 16) + (node.done ? " Étape terminée" : " Marquer comme terminée") + "</button>" +
      '<div class="node-panel-body">' +
      '<div class="field"><label class="field-label">Nom interne (repère dans l\u2019éditeur)</label><input type="text" id="f-node-name" placeholder="ex. Réponse Oui — laissez vide pour reprendre le titre" value="' + escapeHtml(node.name || "") + '"><div class="field-hint">Sert uniquement à vous repérer ici (menus, canevas). N\u2019est jamais visible pour le public.</div></div>' +
      '<div class="field"><label class="field-label">Titre affiché</label><input type="text" id="f-node-title" value="' + escapeHtml(node.title) + '"><div class="field-hint">Titre de cette étape, vu par le public.</div></div>' +
      '<div class="field"><label class="field-label">Explication</label><textarea id="f-node-text" rows="4">' + escapeHtml(node.text) + '</textarea><div class="field-hint">Phrases courtes, une action par phrase.</div></div>' +
      '<div><div class="field-label">Média</div>' + mediaHtml +
      '<div style="display:flex; gap:8px; margin-top:9px; flex-wrap:wrap;">' +
      '<input type="file" id="f-media-upload" accept="image/*" style="flex:1;min-width:160px;">' +
      "</div>" +
      (mediaLib.length ? '<select id="f-media-pick" style="width:100%;margin-top:8px;border:1px solid #D5DEE5;border-radius:10px;padding:8px;"><option value="">Choisir dans la médiathèque…</option>' +
        mediaLib.map(function (m) { return '<option value="' + m.id + '">' + escapeHtml(m.name) + " (" + m.type + ")</option>"; }).join("") + "</select>" : "") +
      '<div class="video-add"><input type="text" id="f-video-url" placeholder="Lien vidéo (YouTube, Vimeo, .mp4…)"><button type="button" class="btn btn-secondary btn-small" id="btn-video-add">Ajouter</button></div>' +
      "</div>" +
      '<div><label class="field-label">Encadré / citation</label><div class="quote-box">' + svgIcon("quote", 17) + '<textarea id="f-node-quote" rows="3">' + escapeHtml(node.quote) + "</textarea></div></div>" +
      '<div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;"><div class="field-label" style="margin:0;">Réponses possibles</div>' +
      '<button type="button" class="btn btn-tint btn-small" id="btn-add-answer">' + svgIcon("plus", 13) + " Ajouter une réponse</button></div>" +
      (node.options.length
        ? '<div class="field-hint" style="margin:0 0 10px;">Tapez le texte du bouton que verra le public, puis choisissez vers quelle étape il mène.</div>'
        : '<div class="end-callout">' + svgIcon("check", 15) + ' <div><strong>Fin de parcours.</strong> Sans réponse, cette étape est un terminus pour le public (bouton "Revenir au début").' +
          (store.settings.phone ? '<label class="end-call-toggle"><input type="checkbox" id="f-node-callbtn"' + (node.showCallButton ? " checked" : "") + '> Proposer aussi d\u2019appeler ' + escapeHtml(store.settings.phone) + '</label>' : '<div class="field-hint" style="margin-top:6px;">Renseignez un téléphone dans Paramètres pour proposer un appel ici.</div>') +
          "</div></div>") +
      '<div id="options-list">' + node.options.map(function (o, i) {
        return '<div class="option-row" data-idx="' + i + '">' +
          '<input type="text" class="f-opt-label" placeholder="Texte du bouton (ex. Oui)" value="' + escapeHtml(o.label || "") + '">' +
          svgIcon("arrow", 15) +
          '<select class="f-opt-target">' + tree.order.filter(function (tid) { return tid !== appState.selectedNodeId; }).map(function (tid) { return '<option value="' + tid + '"' + (o.target === tid ? " selected" : "") + '>' + nodeOptionLabel(tree, tid) + "</option>"; }).join("") + "</select>" +
          '<button type="button" class="del-x" data-remove="' + i + '">\u2715</button></div>';
      }).join("") + "</div></div>" +
      "</div>";

    // wire
    panel.querySelectorAll("[data-goto]").forEach(function (b) {
      b.addEventListener("click", function () { appState.selectedNodeId = b.dataset.goto; renderCanvas(tree); renderNodePanel(tree); });
    });
    if (canDelete) document.getElementById("btn-node-delete").addEventListener("click", function () { deleteNode(tree, appState.selectedNodeId); renderEditor(); });
    document.getElementById("btn-toggle-done").addEventListener("click", function () { node.done = !node.done; saveStore(); renderNodePanel(tree); renderCanvas(tree); });
    document.getElementById("f-node-name").addEventListener("input", function (e) { node.name = e.target.value; saveStore(); });
    document.getElementById("f-node-name").addEventListener("change", function () { renderCanvas(tree); });
    document.getElementById("f-node-title").addEventListener("input", function (e) { node.title = e.target.value; saveStore(); });
    document.getElementById("f-node-title").addEventListener("change", function () { renderCanvas(tree); });
    document.getElementById("f-node-text").addEventListener("input", function (e) { node.text = e.target.value; saveStore(); });
    document.getElementById("f-node-quote").addEventListener("input", function (e) { node.quote = e.target.value; saveStore(); });
    document.getElementById("f-node-quote").addEventListener("change", function () { renderCanvas(tree); });
    document.getElementById("f-media-upload").addEventListener("change", function (e) {
      if (!e.target.files[0]) return;
      addMediaFromFile(e.target.files[0], function (id) {
        node.media = { type: "image", url: store.media[id].url, name: store.media[id].name, meta: store.media[id].meta };
        saveStore(); renderNodePanel(tree); renderCanvas(tree);
      });
    });
    var pick = document.getElementById("f-media-pick");
    if (pick) pick.addEventListener("change", function () {
      if (!pick.value) return;
      var m = store.media[pick.value];
      node.media = { type: m.type, url: m.url, name: m.name, meta: m.meta };
      saveStore(); renderNodePanel(tree); renderCanvas(tree);
    });
    document.getElementById("btn-video-add").addEventListener("click", function () {
      var url = document.getElementById("f-video-url").value.trim();
      if (!url) return;
      var id = addMediaFromUrl(url, "Vidéo");
      node.media = { type: "video", url: store.media[id].url, name: store.media[id].name, meta: store.media[id].meta };
      renderNodePanel(tree); renderCanvas(tree);
    });
    var clearBtn = document.getElementById("btn-media-clear");
    if (clearBtn) clearBtn.addEventListener("click", function () { node.media = null; saveStore(); renderNodePanel(tree); renderCanvas(tree); });
    document.getElementById("btn-add-answer").addEventListener("click", function () { addBranch(tree, appState.selectedNodeId); renderEditor(); });
    var callBtnToggle = document.getElementById("f-node-callbtn");
    if (callBtnToggle) callBtnToggle.addEventListener("change", function (e) { node.showCallButton = e.target.checked; saveStore(); });
    panel.querySelectorAll(".f-opt-label").forEach(function (inp) {
      inp.addEventListener("input", function () { node.options[+inp.closest(".option-row").dataset.idx].label = inp.value; saveStore(); });
      inp.addEventListener("change", function () { renderCanvas(tree); });
    });
    panel.querySelectorAll(".f-opt-target").forEach(function (sel2) {
      sel2.addEventListener("change", function () { node.options[+sel2.closest(".option-row").dataset.idx].target = sel2.value; saveStore(); renderCanvas(tree); });
    });
    panel.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Retirer cette réponse ?")) return;
        node.options.splice(+b.dataset.remove, 1); saveStore(); renderEditor();
      });
    });
  }

  // ---------- Canvas pan & zoom ----------
  function applyCanvasTransform() {
    var inner = document.getElementById("canvas-inner");
    if (!inner) return;
    inner.style.transform = "translate(" + appState.editorPan.x + "px, " + appState.editorPan.y + "px) scale(" + appState.editorZoom + ")";
    var pct = document.getElementById("btn-zoom-reset");
    if (pct) pct.textContent = Math.round(appState.editorZoom * 100) + "%";
  }
  function setZoom(newZoom, anchorX, anchorY) {
    newZoom = Math.max(0.3, Math.min(2.2, newZoom));
    var scroll = document.getElementById("canvas-scroll");
    if (anchorX === undefined) { anchorX = scroll.clientWidth / 2; anchorY = scroll.clientHeight / 2; }
    var contentX = (anchorX - appState.editorPan.x) / appState.editorZoom;
    var contentY = (anchorY - appState.editorPan.y) / appState.editorZoom;
    appState.editorPan.x = anchorX - contentX * newZoom;
    appState.editorPan.y = anchorY - contentY * newZoom;
    appState.editorZoom = newZoom;
    applyCanvasTransform();
  }
  (function initCanvasNav() {
    var scroll = document.getElementById("canvas-scroll");
    scroll.addEventListener("wheel", function (e) {
      if (document.getElementById("canvas-empty") && !document.getElementById("canvas-empty").hidden) return;
      var rect = scroll.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        var factor = Math.pow(1.0015, -e.deltaY);
        setZoom(appState.editorZoom * factor, e.clientX - rect.left, e.clientY - rect.top);
      } else {
        e.preventDefault();
        appState.editorPan.x -= e.deltaX;
        appState.editorPan.y -= e.deltaY;
        applyCanvasTransform();
      }
    }, { passive: false });

    var panState = null;
    scroll.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".tree-node")) return;
      panState = { startX: e.clientX, startY: e.clientY, panX: appState.editorPan.x, panY: appState.editorPan.y };
      scroll.classList.add("panning");
      scroll.setPointerCapture(e.pointerId);
    });
    scroll.addEventListener("pointermove", function (e) {
      if (!panState) return;
      appState.editorPan.x = panState.panX + (e.clientX - panState.startX);
      appState.editorPan.y = panState.panY + (e.clientY - panState.startY);
      applyCanvasTransform();
    });
    function endPan() { panState = null; scroll.classList.remove("panning"); }
    scroll.addEventListener("pointerup", endPan);
    scroll.addEventListener("pointercancel", endPan);

    document.getElementById("btn-zoom-in").addEventListener("click", function () { setZoom(appState.editorZoom * 1.2); });
    document.getElementById("btn-zoom-out").addEventListener("click", function () { setZoom(appState.editorZoom / 1.2); });
    document.getElementById("btn-zoom-reset").addEventListener("click", function () {
      appState.editorZoom = 1; appState.editorPan = { x: 40, y: 40 }; applyCanvasTransform();
    });
  })();

  document.getElementById("btn-rearrange").addEventListener("click", function () {
    var tree = store.trees[appState.activeTreeId];
    if (!tree) return;
    if (!confirm("Recalculer automatiquement la position de toutes les cartes ?")) return;
    tree.nodePos = {};
    saveStore();
    renderCanvas(tree);
  });

  document.getElementById("btn-editor-back").addEventListener("click", function () { setScreen("dash"); });
  document.getElementById("btn-editor-preview").addEventListener("click", function () {
    appState.apercuTreeId = appState.activeTreeId;
    setScreen("apercu");
  });

  // ---------- Media library ----------
  function renderMedia() {
    var filters = ["Tout", "Images", "Vidéos"];
    document.getElementById("media-filters").innerHTML = filters.map(function (f) {
      return '<button type="button" data-f="' + f + '" class="' + (appState.mediaFilter === f ? "active" : "") + '">' + f + "</button>";
    }).join("");
    document.querySelectorAll("#media-filters button").forEach(function (b) {
      b.addEventListener("click", function () { appState.mediaFilter = b.dataset.f; renderMedia(); });
    });

    var items = Object.values(store.media).sort(function (a, b) { return b.createdAt - a.createdAt; });
    if (appState.mediaFilter === "Images") items = items.filter(function (m) { return m.type === "image"; });
    if (appState.mediaFilter === "Vidéos") items = items.filter(function (m) { return m.type === "video"; });

    var grid = document.getElementById("media-grid");
    var isVideoFilter = appState.mediaFilter === "Vidéos";
    var uploadTile = isVideoFilter
      ? '<div class="upload-tile upload-tile-video" id="tile-video-form">' +
        '<input type="text" id="media-video-url" placeholder="Lien vidéo (YouTube, Vimeo, .mp4…)">' +
        '<input type="text" id="media-video-name" placeholder="Nom (optionnel)">' +
        '<button type="button" class="btn btn-primary btn-small" id="btn-media-video-add">' + svgIcon("plus", 13) + " Ajouter la vidéo</button></div>"
      : '<div class="upload-tile" id="tile-upload">' + svgIcon("upload", 26) + "<span style=\"font-size:13.5px;font-weight:700;\">Importer une image</span></div>";
    grid.innerHTML = uploadTile + items.map(function (m) {
      var prev = m.type === "image" ? '<img src="' + m.url + '" alt="">' : svgIcon("vid", 30);
      return '<div class="media-item"><div class="prev">' + prev + '<span class="type-badge">' + (m.type === "image" ? "Image" : "Vidéo") + '</span></div>' +
        '<div class="meta"><div class="name">' + escapeHtml(m.name) + '</div><div class="sub">' + escapeHtml(m.meta || "") + '</div>' +
        '<button type="button" class="btn btn-danger-line btn-small" style="margin-top:8px;" data-del="' + m.id + '">Supprimer</button></div></div>';
    }).join("");
    if (isVideoFilter) {
      document.getElementById("btn-media-video-add").addEventListener("click", function () {
        var url = document.getElementById("media-video-url").value.trim();
        if (!url) return;
        var name = document.getElementById("media-video-name").value.trim();
        addMediaFromUrl(url, name || "Vidéo");
        renderMedia();
      });
    } else {
      document.getElementById("tile-upload").addEventListener("click", function () { document.getElementById("media-file-input").click(); });
    }
    grid.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () { delete store.media[b.dataset.del]; saveStore(); renderMedia(); });
    });
  }
  document.getElementById("media-file-input").addEventListener("change", function (e) {
    Array.prototype.forEach.call(e.target.files, function (f) { addMediaFromFile(f, function () { renderMedia(); }); });
  });

  // ---------- Portals ----------
  function renderPortals() {
    var portals = Object.values(store.portals);
    var grid = document.getElementById("portals-grid");
    if (!portals.length) {
      grid.innerHTML = '<p class="empty-hint">Aucun portail pour l\u2019instant.</p>';
    } else {
      grid.innerHTML = portals.map(function (p) {
        var status = p.lastExportAt ? ["En ligne", "#DCF1F1", "#00777A"] : ["Brouillon", "#E4EAEF", "#5B7789"];
        return '<div class="entity-card' + (p.id === appState.activePortalId ? " selected" : "") + '" data-portal="' + p.id + '">' +
          '<div class="entity-card-top"><div class="entity-icon" style="background:' + p.tint + ';color:' + p.color + ';">' + svgIcon(p.icon, 22) + '</div>' +
          '<span style="display:flex;align-items:center;gap:8px;"><span class="badge" style="background:' + status[1] + ';color:' + status[2] + ';">' + status[0] + '</span>' +
          '<button type="button" class="del-x" data-del-portal="' + p.id + '" title="Supprimer le portail">\u2715</button></span></div>' +
          '<div><div class="entity-title">' + escapeHtml(p.name) + '</div><div class="entity-desc">' + escapeHtml(p.tagline) + '</div></div>' +
          '<div class="entity-foot"><span>/' + escapeHtml(p.slug) + '</span><span>' + p.treeIds.length + ' arbre' + (p.treeIds.length > 1 ? "s" : "") + '</span></div>' +
          '<button type="button" class="btn btn-tint" data-open="' + p.id + '">' + svgIcon("eye", 15) + ' Voir le portail public</button>' +
          "</div>";
      }).join("");
      grid.querySelectorAll(".entity-card").forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (e.target.closest("[data-open]") || e.target.closest("[data-del-portal]")) return;
          appState.activePortalId = card.dataset.portal;
          renderPortals();
        });
      });
      grid.querySelectorAll("[data-open]").forEach(function (b) {
        b.addEventListener("click", function (e) { e.stopPropagation(); appState.portalHomeId = b.dataset.open; setScreen("portalHome"); });
      });
      grid.querySelectorAll("[data-del-portal]").forEach(function (b) {
        b.addEventListener("click", function (e) { e.stopPropagation(); deletePortal(b.dataset.delPortal); });
      });
    }
    renderPortalDetail();
  }

  function renderPortalDetail() {
    var wrap = document.getElementById("portal-detail-wrap");
    var portal = store.portals[appState.activePortalId];
    if (!portal) { wrap.innerHTML = ""; return; }
    var allTrees = Object.values(store.trees);
    var included = portal.treeIds.map(function (id) { return store.trees[id]; }).filter(Boolean);
    var unused = allTrees.filter(function (t) { return Object.values(store.portals).every(function (p) { return p.treeIds.indexOf(t.id) === -1; }); });

    wrap.innerHTML =
      '<div class="panel-card">' +
      '<div class="panel-title">Arbres publiés dans « ' + escapeHtml(portal.name) + ' »</div>' +
      '<div class="panel-sub">L\u2019ordre ci-dessous est celui des cartes sur la page d\u2019accueil du portail. Glissez la poignée <strong>\u2237</strong> pour réordonner.</div>' +
      '<div id="portal-tree-rows">' + (included.length ? included.map(function (t, i) {
        return '<div class="tree-row" data-idx="' + i + '" data-tree-id="' + t.id + '">' +
          '<span class="drag-handle" title="Glisser pour réordonner">' + svgIcon("grip", 20) + '</span>' +
          '<div class="entity-icon" style="width:34px;height:34px;background:' + t.tint + ';color:' + t.color + ';">' + svgIcon(t.icon, 16) + '</div>' +
          '<span class="name">' + escapeHtml(t.title) + '</span>' +
          '<button type="button" class="btn btn-outline btn-small" data-up="' + i + '"' + (i === 0 ? " disabled" : "") + '>\u2191</button>' +
          '<button type="button" class="btn btn-outline btn-small" data-down="' + i + '"' + (i === included.length - 1 ? " disabled" : "") + '>\u2193</button>' +
          '<button type="button" class="btn btn-outline btn-small" data-edit="' + t.id + '">Ouvrir</button>' +
          '<button type="button" class="del-x" data-remove="' + t.id + '">\u2715</button></div>';
      }).join("") : '<p class="empty-hint">Aucun arbre dans ce portail pour l\u2019instant.</p>') + "</div>" +
      '<div class="field-label" style="margin-top:16px;">Ajouter des arbres</div>' +
      '<div class="checkbox-list">' + allTrees.filter(function (t) { return portal.treeIds.indexOf(t.id) === -1; }).map(function (t) {
        return '<label><input type="checkbox" data-add="' + t.id + '"> ' + escapeHtml(t.title) + "</label>";
      }).join("") + "</div>" +
      "</div>" +
      '<div>' +
      '<div class="panel-card">' +
      '<div class="panel-title">Réglages du portail</div>' +
      '<div class="panel-sub">Titre et texte d\u2019accueil vus par la personne.</div>' +
      '<div class="field"><label>Nom du portail</label><input type="text" id="f-portal-name" value="' + escapeHtml(portal.name) + '"></div>' +
      '<div class="field"><label>Phrase d\u2019accueil</label><input type="text" id="f-portal-tagline" value="' + escapeHtml(portal.tagline) + '"></div>' +
      '<div class="field"><label>Texte d\u2019introduction</label><textarea id="f-portal-intro" rows="2">' + escapeHtml(portal.intro) + '</textarea></div>' +
      '<div class="field"><label>Adresse (slug)</label><div class="slug-input-wrap"><span>.../</span><input type="text" id="f-portal-slug" value="' + escapeHtml(portal.slug) + '"></div></div>' +
      '<div class="field-label" style="margin-top:14px;">Mode d\u2019affichage des arbres</div>' +
      '<div class="segmented" id="portal-mode-toggle"><button type="button" data-mode="A" class="' + (portal.mode === "A" ? "active" : "") + '">Plein écran</button><button type="button" data-mode="B" class="' + (portal.mode === "B" ? "active" : "") + '">Pas à pas</button></div>' +
      "</div>" +
      '<div class="panel-card">' +
      '<div class="panel-title">Arbres sans portail</div>' +
      '<div class="panel-sub">Publiés nulle part pour l\u2019instant.</div>' +
      (unused.length ? unused.map(function (t) { return '<span class="pill">' + escapeHtml(t.title) + "</span>"; }).join("") : '<p class="empty-hint">Aucun.</p>') +
      "</div></div>";

    document.getElementById("f-portal-name").addEventListener("input", function (e) { portal.name = e.target.value; saveStore(); });
    document.getElementById("f-portal-name").addEventListener("change", renderPortals);
    document.getElementById("f-portal-tagline").addEventListener("input", function (e) { portal.tagline = e.target.value; saveStore(); });
    document.getElementById("f-portal-intro").addEventListener("input", function (e) { portal.intro = e.target.value; saveStore(); });
    document.getElementById("f-portal-slug").addEventListener("input", function (e) { portal.slug = e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"); saveStore(); });
    document.getElementById("f-portal-slug").addEventListener("change", renderPortals);
    document.querySelectorAll("#portal-mode-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { portal.mode = b.dataset.mode; saveStore(); renderPortalDetail(); });
    });
    wrap.querySelectorAll("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { appState.activeTreeId = b.dataset.edit; appState.selectedNodeId = store.trees[b.dataset.edit].startId; setScreen("editor"); });
    });
    wrap.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () { portal.treeIds = portal.treeIds.filter(function (id) { return id !== b.dataset.remove; }); saveStore(); renderPortals(); });
    });
    wrap.querySelectorAll("[data-add]").forEach(function (cb) {
      cb.addEventListener("change", function () { if (cb.checked) { portal.treeIds.push(cb.dataset.add); saveStore(); renderPortals(); } });
    });
    wrap.querySelectorAll("[data-up]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.up;
        var arr = portal.treeIds; var tmp = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = tmp;
        saveStore(); renderPortalDetail();
      });
    });
    wrap.querySelectorAll("[data-down]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.down;
        var arr = portal.treeIds; var tmp = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = tmp;
        saveStore(); renderPortalDetail();
      });
    });

    var dragState = null;
    var rowsContainer = document.getElementById("portal-tree-rows");

    function getRowEls() { return Array.prototype.slice.call(rowsContainer.querySelectorAll(".tree-row")); }

    function onPointerMove(e) {
      if (!dragState) return;
      e.preventDefault();
      var rows = getRowEls();
      var dragRow = dragState.row;
      var dragIndexNow = rows.indexOf(dragRow);
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r === dragRow) continue;
        var rect = r.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (e.clientY < mid && i < dragIndexNow) { rowsContainer.insertBefore(dragRow, r); break; }
        if (e.clientY > mid && i > dragIndexNow) { rowsContainer.insertBefore(dragRow, r.nextSibling); break; }
      }
    }
    function onPointerUp() {
      if (!dragState) return;
      dragState.row.classList.remove("dragging");
      document.body.classList.remove("dragging-active");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      var newOrder = getRowEls().map(function (r) { return r.dataset.treeId; });
      dragState = null;
      portal.treeIds = newOrder;
      saveStore();
      renderPortalDetail();
    }
    wrap.querySelectorAll(".drag-handle").forEach(function (handle) {
      handle.addEventListener("pointerdown", function (e) {
        var row = handle.closest(".tree-row");
        dragState = { row: row };
        row.classList.add("dragging");
        document.body.classList.add("dragging-active");
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        e.preventDefault();
      });
    });
  }
  document.getElementById("btn-portals-new").addEventListener("click", function () { appState.activePortalId = newPortal(); render(); });

  // ---------- Export bundle builder (shared by preview + zip) ----------
  function buildDataJson(portal, singleTree) {
    var trees = singleTree ? [singleTree] : portal.treeIds.map(function (id) { return store.trees[id]; }).filter(Boolean);
    return {
      org: { name: store.settings.orgName, phone: store.settings.phone },
      accent: store.settings.accentColor,
      bg: store.settings.bgColor,
      textSize: store.settings.textSize,
      trackingSnippet: store.settings.trackingSnippet,
      portalName: portal.name,
      portalTagline: portal.tagline,
      portalIntro: portal.intro,
      mode: portal.mode,
      trees: trees.map(function (t) { return { id: t.id, title: t.title, description: t.description, icon: t.icon, color: t.color, tint: t.tint, startId: t.startId, nodes: t.nodes }; })
    };
  }
  function buildBundleHtml(dataJson, previewConfig) {
    var head = previewConfig ? "window.ADI_PREVIEW = " + JSON.stringify(previewConfig) + ";" : "";
    var script = "<script>" + head + "window.ADI_DATA = " + JSON.stringify(dataJson) + ";\n" + templates["script.js"] + "<\/script>";
    var html = templates["index.html"]
      .replace('<link rel="stylesheet" href="style.css">', "<style>" + templates["style.css"] + "</style>")
      .replace('<script src="script.js"><\/script>', script);
    return html;
  }
  function openBundleInNewTab(html) {
    var blob = new Blob([html], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var win = window.open(url, "_blank");
    if (!win) { toast("Votre navigateur a bloqué l\u2019ouverture du nouvel onglet (pop-up)."); return; }
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
  }

  document.getElementById("btn-editor-newtab").addEventListener("click", function () {
    var tree = store.trees[appState.activeTreeId];
    if (!tree) return;
    var pseudoPortal = { name: tree.title, tagline: "", intro: "", mode: "A", treeIds: [] };
    var dataJson = buildDataJson(pseudoPortal, tree);
    openBundleInNewTab(buildBundleHtml(dataJson, { startTreeId: tree.id, mode: "A" }));
  });

  // ---------- Portail d'accueil (preview) ----------
  function renderPortalHome() {
    var portals = Object.values(store.portals);
    var sel = document.getElementById("portalhome-select");
    if (!portals.length) {
      document.getElementById("portalhome-frame").srcdoc = "";
      document.getElementById("portalhome-url").textContent = "";
      sel.innerHTML = "";
      return;
    }
    if (!appState.portalHomeId || !store.portals[appState.portalHomeId]) appState.portalHomeId = portals[0].id;
    sel.innerHTML = portals.map(function (p) { return '<option value="' + p.id + '"' + (p.id === appState.portalHomeId ? " selected" : "") + '>' + escapeHtml(p.name) + "</option>"; }).join("");
    sel.onchange = function () { appState.portalHomeId = sel.value; renderPortalHome(); };
    var portal = store.portals[appState.portalHomeId];
    document.getElementById("portalhome-url").textContent = "aide.exemple.org/" + portal.slug;
    document.getElementById("portalhome-frame").srcdoc = buildBundleHtml(buildDataJson(portal));
  }
  document.getElementById("btn-portalhome-newtab").addEventListener("click", function () {
    var portal = store.portals[appState.portalHomeId];
    if (!portal) return;
    openBundleInNewTab(buildBundleHtml(buildDataJson(portal)));
  });

  // ---------- Aperçu (single tree) ----------
  function renderApercu() {
    var trees = Object.values(store.trees);
    var sel = document.getElementById("apercu-tree-select");
    if (!trees.length) {
      document.getElementById("apercu-frame").srcdoc = "";
      sel.innerHTML = "";
      return;
    }
    if (!appState.apercuTreeId || !store.trees[appState.apercuTreeId]) appState.apercuTreeId = trees[0].id;
    sel.innerHTML = trees.map(function (t) { return '<option value="' + t.id + '"' + (t.id === appState.apercuTreeId ? " selected" : "") + '>' + escapeHtml(t.title) + "</option>"; }).join("");
    sel.onchange = function () { appState.apercuTreeId = sel.value; renderApercu(); };

    document.querySelectorAll("#apercu-mode-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === appState.apercuMode);
      b.onclick = function () { appState.apercuMode = b.dataset.mode; renderApercu(); };
    });

    var tree = store.trees[appState.apercuTreeId];
    document.getElementById("apercu-sub").textContent = tree.title + " · ce que verra la personne sur le site publié.";
    document.getElementById("apercu-url").textContent = "aide.exemple.org/apercu/" + tree.id;
    var pseudoPortal = { name: tree.title, tagline: "", intro: "", mode: appState.apercuMode, treeIds: [] };
    var dataJson = buildDataJson(pseudoPortal, tree);
    document.getElementById("apercu-frame").srcdoc = buildBundleHtml(dataJson, { startTreeId: tree.id, mode: appState.apercuMode });
  }
  document.getElementById("btn-apercu-restart").addEventListener("click", renderApercu);
  document.getElementById("btn-apercu-newtab").addEventListener("click", function () {
    var tree = store.trees[appState.apercuTreeId];
    if (!tree) return;
    var pseudoPortal = { name: tree.title, tagline: "", intro: "", mode: appState.apercuMode, treeIds: [] };
    var dataJson = buildDataJson(pseudoPortal, tree);
    openBundleInNewTab(buildBundleHtml(dataJson, { startTreeId: tree.id, mode: appState.apercuMode }));
  });

  // ---------- Publication ----------
  function buildQrSvg(text) {
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 4 });
  }
  function renderPublish() {
    var portals = Object.values(store.portals);
    var sel = document.getElementById("publish-portal-select");
    var body = document.getElementById("publish-body");
    if (!portals.length) { body.innerHTML = '<p class="empty-hint">Créez d\u2019abord un portail dans l\u2019onglet Portails.</p>'; sel.innerHTML = ""; return; }
    if (!appState.publishPortalId || !store.portals[appState.publishPortalId]) appState.publishPortalId = portals[0].id;
    sel.innerHTML = portals.map(function (p) { return '<option value="' + p.id + '"' + (p.id === appState.publishPortalId ? " selected" : "") + '>' + escapeHtml(p.name) + "</option>"; }).join("");
    sel.onchange = function () { appState.publishPortalId = sel.value; renderPublish(); };

    var portal = store.portals[appState.publishPortalId];
    var dataJson = buildDataJson(portal);
    var dataStr = JSON.stringify(dataJson, null, 2);
    var files = [
      ["index.html", templates["index.html"].length],
      ["style.css", templates["style.css"].length],
      ["script.js", templates["script.js"].length],
      ["data.json", dataStr.length]
    ];
    if (store.settings.trackingURL) {}
    var publicUrl = "https://aide.exemple.org/" + portal.slug + "/";

    body.innerHTML =
      '<div class="panel-card"><div class="publish-status">' +
      '<div><div><span class="status-dot" style="background:' + (portal.lastExportAt ? "#00777A" : "#8CA1B0") + ';"></span><span style="font-size:13px;font-weight:700;color:' + (portal.lastExportAt ? "#00777A" : "#8CA1B0") + ';">' + (portal.lastExportAt ? "Exporté" : "Pas encore exporté") + '</span></div>' +
      '<div style="font-size:19px;font-weight:700;margin-top:4px;">' + escapeHtml(portal.slug) + '/</div>' +
      '<div style="font-size:13.5px;color:#5B7789;margin-top:5px;">' + (portal.lastExportAt ? "Dernier export : " + new Date(portal.lastExportAt).toLocaleString("fr-FR") : "Cliquez sur Exporter pour générer le .zip") + " · " + dataJson.trees.length + " arbres inclus</div></div>" +
      '<div style="display:flex;gap:10px;"><button type="button" class="btn btn-primary btn-lg" id="btn-export-zip">' + svgIcon("download", 16) + " Exporter le portail (.zip)</button></div>" +
      "</div></div>" +
      '<div class="publish-grid">' +
      '<div class="panel-card"><div class="panel-title">Fichiers générés</div><div>' +
      files.map(function (f) { return '<div class="file-row">' + svgIcon("file", 16) + '<span class="fname">' + f[0] + '</span><span class="fsize">~' + Math.max(1, Math.round(f[1] / 1024)) + " Ko</span></div>"; }).join("") +
      '<div class="file-row">' + svgIcon("file", 16) + '<span class="fname">qrcode.svg</span><span class="fsize">(si adresse renseignée)</span></div>' +
      "</div></div>" +
      '<div class="panel-card"><div class="panel-title">QR code</div><div class="panel-sub">Pointe vers l\u2019adresse ci-dessus une fois le portail hébergé.</div>' +
      '<div class="field"><label>Adresse une fois en ligne</label><input type="text" id="f-publish-url" value="' + escapeHtml(publicUrl) + '"></div>' +
      '<div class="qr-box" id="publish-qr">' + buildQrSvg(publicUrl) + "</div></div>" +
      "</div>";

    document.getElementById("f-publish-url").addEventListener("input", function (e) {
      document.getElementById("publish-qr").innerHTML = e.target.value.trim() ? buildQrSvg(e.target.value.trim()) : "";
    });

    document.getElementById("btn-export-zip").addEventListener("click", function () { exportPortalZip(portal); });
  }

  function exportPortalZip(portal) {
    if (!portal.treeIds.length) { toast("Ajoutez au moins un arbre à ce portail avant d\u2019exporter."); return; }
    var dataJson = buildDataJson(portal);
    var zip = new JSZip();
    zip.file("index.html", templates["index.html"]);
    zip.file("style.css", templates["style.css"]);
    zip.file("script.js", templates["script.js"]);
    zip.file("data.json", JSON.stringify(dataJson, null, 2));
    var publicUrl = document.getElementById("f-publish-url").value.trim() || ("https://aide.exemple.org/" + portal.slug + "/");
    zip.file("qrcode.svg", buildQrSvg(publicUrl));
    zip.file("LISEZMOI.txt",
      "Ce dossier est un portail statique.\n\n" +
      "1. Déposez tout le contenu de ce dossier sur votre hébergement web (le portail doit être servi via http/https, pas ouvert en double-clic).\n" +
      "2. Pour modifier le contenu après publication : modifiez-le dans l\u2019éditeur, ré-exportez, puis remplacez uniquement le fichier data.json sur l\u2019hébergement.\n" +
      "3. qrcode.svg pointe vers : " + publicUrl + "\n");
    zip.generateAsync({ type: "blob" }).then(function (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (portal.slug || "portail") + ".zip";
      a.click();
      portal.lastExportAt = Date.now();
      saveStore();
      renderPublish();
      toast("Export terminé.");
    });
  }

  // ---------- Settings ----------
  function renderSettings() {
    document.getElementById("btn-backup-export").onclick = function () {
      var blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sauvegarde-arbres-decision.json";
      a.click();
      toast("Sauvegarde téléchargée.");
    };
    document.getElementById("btn-backup-import").onclick = function () { document.getElementById("backup-file-input").click(); };
    document.getElementById("backup-file-input").onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var parsed;
        try { parsed = JSON.parse(reader.result); } catch (err) { toast("Fichier invalide."); return; }
        if (!parsed || typeof parsed !== "object" || !parsed.trees || !parsed.portals) { toast("Ce fichier ne ressemble pas à une sauvegarde valide."); return; }
        if (!confirm("Remplacer toutes les données actuelles de ce navigateur par celles de cette sauvegarde ?")) return;
        store.settings = Object.assign(defaultSettings(), parsed.settings || {});
        store.trees = parsed.trees || {};
        store.portals = parsed.portals || {};
        store.media = parsed.media || {};
        saveStore();
        appState.activeTreeId = null; appState.activePortalId = null;
        toast("Sauvegarde importée.");
        render();
      };
      reader.readAsText(file);
      e.target.value = "";
    };

    document.getElementById("set-org-name").value = store.settings.orgName;
    document.getElementById("set-org-phone").value = store.settings.phone;
    document.getElementById("set-tracking").value = store.settings.trackingSnippet;
    document.getElementById("set-org-name").oninput = function (e) { store.settings.orgName = e.target.value; saveStore(); renderSidebarFooter(); };
    document.getElementById("set-org-phone").oninput = function (e) { store.settings.phone = e.target.value; saveStore(); };
    document.getElementById("set-tracking").oninput = function (e) { store.settings.trackingSnippet = e.target.value; saveStore(); };

    document.getElementById("set-swatches").innerHTML = PALETTE.map(function (p) {
      return '<div class="swatch' + (store.settings.accentColor === p.color ? " active" : "") + '" data-color="' + p.color + '" style="background:' + p.color + ';"></div>';
    }).join("");
    document.querySelectorAll("#set-swatches .swatch").forEach(function (sw) {
      sw.addEventListener("click", function () { store.settings.accentColor = sw.dataset.color; saveStore(); renderSettings(); });
    });

    document.getElementById("set-bg-swatches").innerHTML = BG_PALETTE.map(function (c) {
      return '<div class="swatch' + (store.settings.bgColor === c ? " active" : "") + '" data-color="' + c + '" style="background:' + c + ';"></div>';
    }).join("");
    document.querySelectorAll("#set-bg-swatches .swatch").forEach(function (sw) {
      sw.addEventListener("click", function () { store.settings.bgColor = sw.dataset.color; saveStore(); renderSettings(); });
    });

    var sizes = [["normal", "Normal", 15], ["grand", "Grand", 18], ["tres-grand", "Très grand", 22]];
    document.getElementById("set-sizes").innerHTML = sizes.map(function (s) {
      return '<button type="button" data-size="' + s[0] + '" class="' + (store.settings.textSize === s[0] ? "active" : "") + '" style="font-size:' + s[2] + 'px;">' + s[1] + "</button>";
    }).join("");
    document.querySelectorAll("#set-sizes button").forEach(function (b) {
      b.addEventListener("click", function () { store.settings.textSize = b.dataset.size; saveStore(); renderSettings(); });
    });
  }

  // ---------- Stats (contenu, pas de suivi intégré) ----------
  function renderStats() {
    var trees = Object.values(store.trees);
    var cards = [
      { label: "Arbres au total", value: trees.length },
      { label: "Étapes rédigées", value: trees.reduce(function (a, t) { return a + t.order.length; }, 0) },
      { label: "Portails publiés", value: Object.values(store.portals).filter(function (p) { return p.lastExportAt; }).length },
      { label: "Médias en bibliothèque", value: Object.keys(store.media).length }
    ];
    document.getElementById("stats-content").innerHTML = cards.map(function (c) {
      return '<div class="stat-card"><div class="label">' + c.label + '</div><div class="value">' + c.value + "</div></div>";
    }).join("");
    document.getElementById("stats-tracking-info").innerHTML =
      '<div class="panel-title">Fréquentation réelle</div>' +
      '<div class="panel-sub">Un site exporté est statique : il n\u2019y a pas de serveur pour compter les visites. Pour un suivi respectueux de la vie privée, collez le code d\u2019un outil comme Plausible, Umami ou GoatCounter dans <strong>Paramètres → Suivi de fréquentation</strong> : il sera inclus dans les prochains exports.</div>';
  }

  // ---------- Tutoriel de bienvenue ----------
  var TUTORIAL_SLIDES = [
    {
      icon: "tree",
      title: "Bienvenue !",
      body: "Cet outil sert à créer des mini-sites d\u2019aide en libre-service : la personne répond à des questions simples et arrive, étape par étape, à la solution de son problème.",
      nav: "dash"
    },
    {
      icon: "list",
      title: "Les arbres de décision",
      body: "Un arbre est un enchaînement d\u2019étapes. Chaque étape a un titre, une explication, et éventuellement une ou plusieurs réponses. Chaque réponse a son propre texte de bouton et mène vers l\u2019étape suivante.",
      nav: "editor"
    },
    {
      icon: "check",
      title: "Les fins de parcours",
      body: "Une étape sans réponse devient automatiquement une fin. Vous pouvez y proposer un bouton pour appeler un technicien, en plus du bouton \u00ab Recommencer \u00bb.",
      nav: "editor"
    },
    {
      icon: "layers",
      title: "Les portails",
      body: "Un portail regroupe un ou plusieurs arbres dans un site public unique, avec son propre nom, ses couleurs et une adresse. La personne choisit d\u2019abord son problème sur la page d\u2019accueil, puis suit l\u2019arbre correspondant.",
      nav: "portals"
    },
    {
      icon: "download",
      title: "Publier votre site",
      body: "Une fois vos arbres et votre portail prêts, direction l\u2019onglet Publication : téléchargez un dossier .zip prêt à héberger sur n\u2019importe quel site web, avec son propre QR code d\u2019accès.",
      nav: "publish", highlight: "#btn-export-zip"
    },
    {
      icon: "upload",
      title: "Où vont vos données ?",
      body: "Rien n\u2019est envoyé automatiquement nulle part : tout reste dans ce navigateur tant que vous ne faites rien. \u00ab Exporter \u00bb télécharge simplement un .zip sur votre ordinateur \u2014 c\u2019est ensuite à vous de le déposer sur un hébergement (GitHub Pages ou autre). Vos images y sont déjà incluses, un seul dépôt suffit. Pensez à Paramètres \u2192 Sauvegarde pour ne jamais perdre votre travail.",
      nav: "settings", highlight: "#btn-backup-export"
    }
  ];
  var tutorialIndex = 0;
  function highlightNav(screenName) {
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("tutorial-highlight", !!screenName && b.dataset.screen === screenName);
    });
  }
  var currentHighlightEl = null;
  function highlightElement(selector) {
    if (currentHighlightEl) { currentHighlightEl.classList.remove("tutorial-highlight-el"); currentHighlightEl = null; }
    if (!selector) return;
    var el = document.querySelector(selector);
    if (el) { el.classList.add("tutorial-highlight-el"); currentHighlightEl = el; }
  }
  function renderTutorial() {
    var s = TUTORIAL_SLIDES[tutorialIndex];
    if (s.nav) setScreen(s.nav);
    document.getElementById("tutorial-icon").innerHTML = svgIcon(s.icon, 28);
    document.getElementById("tutorial-title").textContent = s.title;
    document.getElementById("tutorial-body").textContent = s.body;
    document.getElementById("tutorial-dots").innerHTML = TUTORIAL_SLIDES.map(function (_, i) {
      return '<span class="' + (i === tutorialIndex ? "active" : "") + '"></span>';
    }).join("");
    var prevBtn = document.getElementById("btn-tutorial-prev");
    var nextBtn = document.getElementById("btn-tutorial-next");
    prevBtn.disabled = tutorialIndex === 0;
    nextBtn.textContent = tutorialIndex === TUTORIAL_SLIDES.length - 1 ? "Commencer" : "Suivant";
    highlightNav(s.nav);
    highlightElement(s.highlight);
  }
  function showTutorial() {
    tutorialIndex = 0;
    renderTutorial();
    document.getElementById("tutorial-overlay").hidden = false;
  }
  var demoWasAutoSeeded = false;
  function closeTutorial() {
    document.getElementById("tutorial-overlay").hidden = true;
    highlightNav(null);
    highlightElement(null);
    store.settings.tutorialSeen = true;
    saveStore();
    if (demoWasAutoSeeded) {
      demoWasAutoSeeded = false;
      if (!confirm("Garder les arbres et portails d\u2019exemple pour vous en inspirer\u202f? (Annuler pour tout supprimer et repartir d\u2019une page vierge)")) {
        store.trees = {};
        store.portals = {};
        appState.activeTreeId = null;
        appState.activePortalId = null;
        appState.portalHomeId = null;
        appState.apercuTreeId = null;
        appState.publishPortalId = null;
        saveStore();
      }
    }
    setScreen("dash");
  }
  document.getElementById("btn-tutorial-prev").addEventListener("click", function () { if (tutorialIndex > 0) { tutorialIndex--; renderTutorial(); } });
  document.getElementById("btn-tutorial-next").addEventListener("click", function () {
    if (tutorialIndex < TUTORIAL_SLIDES.length - 1) { tutorialIndex++; renderTutorial(); } else { closeTutorial(); }
  });
  document.getElementById("btn-tutorial-skip").addEventListener("click", closeTutorial);
  document.getElementById("btn-tutorial-relaunch").addEventListener("click", showTutorial);
  document.getElementById("btn-load-example").addEventListener("click", function () {
    var demo = createExampleTree();
    appState.activeTreeId = demo.treeId;
    appState.activePortalId = demo.portalId;
    toast("Arbre et portail d\u2019exemple créés.");
    setScreen("editor");
  });
  document.getElementById("btn-full-reset").addEventListener("click", function () {
    if (!confirm("Tout effacer (arbres, portails, médias, réglages) et repartir comme à la première ouverture ? Cette action est définitive.")) return;
    if (!confirm("Dernière confirmation : vraiment tout réinitialiser ?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  // ---------- Init ----------
  setScreen("dash");
  if (!store.settings.tutorialSeen) {
    if (!Object.keys(store.trees).length) {
      var demo0 = createExampleTree();
      appState.activeTreeId = demo0.treeId;
      appState.activePortalId = demo0.portalId;
      appState.portalHomeId = demo0.portalId;
      appState.apercuTreeId = demo0.treeId;
      appState.publishPortalId = demo0.portalId;
      demoWasAutoSeeded = true;
    }
    showTutorial();
  }
})();
