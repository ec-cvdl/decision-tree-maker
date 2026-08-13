const ICONS = {
  home:'<path d="M4 10.5L12 4l8 6.5V19a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19z"/>',
  tree:'<circle cx="12" cy="4.5" r="2.2"/><circle cx="5.5" cy="19.5" r="2.2"/><circle cx="18.5" cy="19.5" r="2.2"/><path d="M12 6.7v4.3M5.5 17.3V13a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v4.3"/>',
  media:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="2.8"/>',
  send:'<path d="M21 3L10.5 13.5M21 3l-6.7 18-3.8-7.5L3 9.7z"/>',
  gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  layers:'<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12.5L12 17l9-4.5"/><path d="M3 17l9 4.5 9-4.5"/>',
  grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.4M12 17h.01"/>',
  list:'<path d="M4 6h16M4 12h16M4 18h9"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16 9.6"/>',
  phone:'<path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6 2 2 0 0 1 2-2.2h2.6a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L9.5 10a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.5 1.8z"/>',
  img:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
  vid:'<rect x="2" y="5" width="14" height="14" rx="3"/><path d="M16 10.5L22 7v10l-6-3.5z"/>',
  quote:'<path d="M9 7H5.5A2.5 2.5 0 0 0 3 9.5v3A2.5 2.5 0 0 0 5.5 15H7v2H4M20 7h-3.5A2.5 2.5 0 0 0 14 9.5v3a2.5 2.5 0 0 0 2.5 2.5H18v2h-3"/>',
  file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  wifi:'<path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.7a10.5 10.5 0 0 1 13 0M8.5 16.4a6 6 0 0 1 7 0"/><path d="M12 20h.01"/>',
  power:'<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  slow:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  screen:'<rect x="2.5" y="4" width="19" height="13" rx="2.5"/><path d="M8.5 21h7"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  sound:'<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 9.5a4 4 0 0 1 0 5M18.8 7a8 8 0 0 1 0 10"/>',
  virus:'<path d="M12 3l8 3.5v5c0 5-3.4 8.7-8 9.5-4.6-.8-8-4.5-8-9.5v-5z"/><path d="M12 9v3.5M12 16h.01"/>',
  update:'<path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 20v-4h4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  arrow:'<path d="M5 12h14M13 5l7 7-7 7"/>',
  trash:'<path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download:'<path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'
};
(function () {
  "use strict";

  function svg(key, size) {
    size = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[key] || "") + "</svg>";
  }

  var KIND_META = {
    question: { label: "Question", icon: "question" },
    etape: { label: "Manipulation", icon: "list" },
    fin: { label: "C'est réglé", icon: "check" },
    contact: { label: "Passer la main", icon: "phone" }
  };

  var els = {};
  ["view-home", "view-tree", "portal-title", "org-name", "brand-badge", "portal-tagline", "portal-intro",
   "search-input", "tree-grid", "no-results", "contact-banner", "contact-phone",
   "btn-home", "mode-a", "mode-b", "btn-back-a", "progress-bar", "step-num",
   "kind-icon-a", "kind-label-a", "step-title-a", "step-text-a", "step-media-a", "step-quote-a", "step-options-a", "step-end-a",
   "trail", "kind-icon-b", "kind-label-b", "step-title-b", "step-text-b", "step-media-b", "step-quote-b", "step-options-b", "step-end-b",
   "load-error"
  ].forEach(function (id) { els[id.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] = document.getElementById(id); });

  var data = null;
  var currentTree = null;
  var currentNodeId = null;
  var history = [];
  var mode = "A";
  var startTreeId = null;

  if (window.ADI_PREVIEW) {
    startTreeId = window.ADI_PREVIEW.startTreeId || null;
    mode = window.ADI_PREVIEW.mode || "A";
  }

  function optionText(tree, opt) {
    var target = tree.nodes[opt.target];
    if (target && target.title) return target.title;
    return opt.label || "";
  }

  function renderMedia(container, media) {
    container.innerHTML = "";
    if (!media) { container.hidden = true; return; }
    container.hidden = false;
    if (media.type === "image" && media.url) {
      var img = document.createElement("img");
      img.src = media.url;
      img.alt = media.name || "";
      container.appendChild(img);
    } else if (media.type === "video" && media.url) {
      if (/youtube\.com|youtu\.be|vimeo\.com/.test(media.url)) {
        var iframe = document.createElement("iframe");
        iframe.src = media.url;
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16/9";
        iframe.style.border = "0";
        iframe.title = media.name || "Vidéo";
        iframe.allowFullscreen = true;
        container.appendChild(iframe);
      } else {
        var video = document.createElement("video");
        video.src = media.url;
        video.controls = true;
        container.appendChild(video);
      }
    } else {
      var fb = document.createElement("div");
      fb.className = "media-fallback";
      fb.innerHTML = svg("img", 28) + "<span>" + (media.name || "Média") + "</span>";
      container.appendChild(fb);
    }
  }

  // ---------- Home ----------
  function renderHome() {
    document.title = data.portalName || "Portail d'aide";
    els.orgName.textContent = data.org && data.org.name ? data.org.name : "";
    els.portalTitle.textContent = data.portalName || "";
    els.brandBadge.style.background = data.accent || "#00ACB0";
    els.portalTagline.textContent = data.portalTagline || "";
    els.portalIntro.textContent = data.portalIntro || "";

    if (data.org && data.org.phone) {
      els.contactBanner.hidden = false;
      els.contactPhone.textContent = data.org.phone;
      els.contactPhone.href = "tel:" + data.org.phone.replace(/[^0-9+]/g, "");
    }

    function draw(filter) {
      els.treeGrid.innerHTML = "";
      var q = (filter || "").trim().toLowerCase();
      var any = false;
      (data.trees || []).forEach(function (tree) {
        if (q && tree.title.toLowerCase().indexOf(q) === -1 && (tree.description || "").toLowerCase().indexOf(q) === -1) return;
        any = true;
        var card = document.createElement("button");
        card.type = "button";
        card.className = "tree-card";
        card.setAttribute("role", "listitem");
        var iconWrap = document.createElement("div");
        iconWrap.className = "tree-icon";
        iconWrap.style.background = tree.tint || "#DFF3F3";
        iconWrap.style.color = tree.color || "#00ACB0";
        iconWrap.innerHTML = svg(tree.icon || "grid", 30);
        card.appendChild(iconWrap);
        var textWrap = document.createElement("div");
        textWrap.innerHTML = '<div class="tree-card-title"></div><div class="tree-card-desc"></div>';
        textWrap.querySelector(".tree-card-title").textContent = tree.title;
        textWrap.querySelector(".tree-card-desc").textContent = tree.description || "";
        card.appendChild(textWrap);
        card.addEventListener("click", function () { openTree(tree); });
        els.treeGrid.appendChild(card);
      });
      els.noResults.hidden = any || !q;
    }
    draw("");
    els.searchInput.addEventListener("input", function () { draw(els.searchInput.value); });
  }

  function showHome() {
    els.viewTree.hidden = true;
    els.viewHome.hidden = false;
  }

  // ---------- Tree flow ----------
  function openTree(tree) {
    currentTree = tree;
    currentNodeId = tree.startId;
    history = [];
    els.viewHome.hidden = true;
    els.viewTree.hidden = false;
    els.modeA.hidden = mode !== "A";
    els.modeB.hidden = mode !== "B";
    render();
  }

  els.btnHome.addEventListener("click", function (e) { e.preventDefault(); showHome(); });
  els.btnBackA.addEventListener("click", function () {
    if (history.length) { currentNodeId = history.pop(); render(); }
  });

  function goToOption(target) {
    history.push(currentNodeId);
    currentNodeId = target;
    render();
  }

  function restart() {
    history = [];
    currentNodeId = currentTree.startId;
    render();
  }

  function renderEndActions(container) {
    container.innerHTML = "";
    container.hidden = false;
    var node = currentTree.nodes[currentNodeId];
    var restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.className = "btn-primary-lg";
    restartBtn.textContent = "Revenir au début";
    restartBtn.addEventListener("click", restart);
    container.appendChild(restartBtn);
    if (node.kind === "contact" && data.org && data.org.phone) {
      var callBtn = document.createElement("a");
      callBtn.className = "btn-secondary-lg";
      callBtn.href = "tel:" + data.org.phone.replace(/[^0-9+]/g, "");
      callBtn.textContent = "Appeler " + data.org.phone;
      container.appendChild(callBtn);
    }
  }

  function render() {
    var node = currentTree.nodes[currentNodeId];
    if (!node) return;
    var meta = KIND_META[node.kind] || KIND_META.etape;
    var isEnd = !node.options || node.options.length === 0;

    if (mode === "A") {
      var stepNum = history.length + 1;
      els.progressBar.style.width = Math.min(100, Math.round((stepNum / 5) * 100)) + "%";
      els.stepNum.textContent = "Étape " + stepNum;
      els.btnBackA.style.visibility = history.length ? "visible" : "hidden";
      els.kindIconA.innerHTML = svg(meta.icon, 22);
      els.kindLabelA.textContent = meta.label;
      els.stepTitleA.textContent = node.title;
      els.stepTextA.textContent = node.text;
      renderMedia(els.stepMediaA, node.media);
      if (node.quote && node.quote.trim()) { els.stepQuoteA.hidden = false; els.stepQuoteA.textContent = node.quote; }
      else { els.stepQuoteA.hidden = true; }
      els.stepOptionsA.innerHTML = "";
      (node.options || []).forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-btn";
        btn.innerHTML = "<span></span>" + svg("arrow", 24);
        btn.querySelector("span").textContent = optionText(currentTree, opt);
        btn.addEventListener("click", function () { goToOption(opt.target); });
        els.stepOptionsA.appendChild(btn);
      });
      if (isEnd) renderEndActions(els.stepEndA); else { els.stepEndA.hidden = true; els.stepEndA.innerHTML = ""; }
      els.stepTitleA.focus();
    } else {
      var trailIds = history.concat([currentNodeId]);
      els.trail.innerHTML = "";
      trailIds.forEach(function (id, i) {
        var n = currentTree.nodes[id];
        var last = i === trailIds.length - 1;
        var nextId = trailIds[i + 1];
        var answer = nextId ? (currentTree.nodes[nextId] ? currentTree.nodes[nextId].title : "") : "En cours";
        var row = document.createElement("div");
        row.className = "trail-item";
        row.innerHTML =
          '<div class="trail-col"><div class="trail-dot"></div><div class="trail-line"></div></div>' +
          '<div class="trail-body"><div class="trail-title"></div><div class="trail-answer"></div></div>';
        row.querySelector(".trail-dot").textContent = i + 1;
        row.querySelector(".trail-dot").style.background = last ? "#00ACB0" : "#C3D0DA";
        row.querySelector(".trail-dot").style.color = last ? "#fff" : "#5B7789";
        row.querySelector(".trail-title").textContent = n.title;
        row.querySelector(".trail-title").style.color = last ? "#002743" : "#5B7789";
        row.querySelector(".trail-answer").textContent = answer || "";
        els.trail.appendChild(row);
      });
      els.kindIconB.innerHTML = svg(meta.icon, 18);
      els.kindLabelB.textContent = meta.label;
      els.stepTitleB.textContent = node.title;
      els.stepTextB.textContent = node.text;
      renderMedia(els.stepMediaB, node.media);
      if (node.quote && node.quote.trim()) { els.stepQuoteB.hidden = false; els.stepQuoteB.textContent = node.quote; }
      else { els.stepQuoteB.hidden = true; }
      els.stepOptionsB.innerHTML = "";
      (node.options || []).forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-btn";
        btn.innerHTML = "<span></span>" + svg("arrow", 22);
        btn.querySelector("span").textContent = optionText(currentTree, opt);
        btn.addEventListener("click", function () { goToOption(opt.target); });
        els.stepOptionsB.appendChild(btn);
      });
      if (isEnd) renderEndActions(els.stepEndB); else { els.stepEndB.hidden = true; els.stepEndB.innerHTML = ""; }
      els.stepTitleB.focus();
    }
  }

  function boot(json) {
      data = json;
      if (data.accent) document.documentElement.style.setProperty("--accent", data.accent);
      if (data.bg) document.documentElement.style.setProperty("--bg", data.bg);
      if (data.textSize === "grand") document.documentElement.style.setProperty("--base-fs", "18px");
      if (data.textSize === "tres-grand") document.documentElement.style.setProperty("--base-fs", "21px");
      if (data.trackingSnippet) {
        var wrap = document.createElement("div");
        wrap.innerHTML = data.trackingSnippet;
        Array.prototype.forEach.call(wrap.childNodes, function (n) { document.head.appendChild(n); });
      }
      renderHome();
      if (startTreeId) {
        var t = (data.trees || []).find(function (x) { return x.id === startTreeId; });
        if (t) { openTree(t); return; }
      }
      if (!window.ADI_PREVIEW) mode = data.mode || "A";
      showHome();
  }

  if (window.ADI_DATA) {
    boot(window.ADI_DATA);
  } else {
    fetch("data.json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(boot)
      .catch(function () { els.loadError.hidden = false; });
  }
})();
