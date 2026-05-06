(async function () {
  const modeTitle = document.getElementById("modeTitle");
  const modeDesc = document.getElementById("modeDesc");
  const logoutBtn = document.getElementById("logoutBtn");

  async function getSession() {
    const res = await fetch("/api/session");
    return res.json();
  }

  function updateModeUI(session) {
    if (!modeTitle) return;
    if (session.mode === "owner") {
      modeTitle.textContent = "Owner Mode";
      if (modeDesc) modeDesc.textContent = "You are logged in as the Periwinkle team owner.";
    } else if (session.mode === "viewer") {
      modeTitle.textContent = "Viewer Mode — " + session.ign;
      if (modeDesc) modeDesc.textContent = "Logged in as " + session.ign + " (" + session.discord + "). You can submit trade requests.";
    } else {
      modeTitle.textContent = "Guest Mode";
      if (modeDesc) modeDesc.textContent = "Log in through the Access page before submitting or managing trade requests.";
    }
  }

  function applySessionToPage(session) {
    updateModeUI(session);

    const viewerOnlySections = document.querySelectorAll(".viewer-only");
    const ownerOnlySections = document.querySelectorAll(".owner-only");

    viewerOnlySections.forEach(el => {
      el.style.display = session.mode === "viewer" ? "" : "none";
    });
    ownerOnlySections.forEach(el => {
      el.style.display = session.mode === "owner" ? "" : "none";
    });
  }

  const session = await getSession();
  applySessionToPage(session);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/logout", { method: "POST" });
      window.location.reload();
    });
  }

  const viewerLoginForm = document.getElementById("viewerLoginForm");
  if (viewerLoginForm) {
    viewerLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ign = document.getElementById("viewerIgn").value.trim();
      const discord = document.getElementById("viewerDiscord").value.trim();
      const res = await fetch("/api/login-viewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ign, discord }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Login failed.");
      }
    });
  }

  const ownerLoginForm = document.getElementById("ownerLoginForm");
  if (ownerLoginForm) {
    ownerLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("ownerUsername").value.trim();
      const password = document.getElementById("ownerPassword").value;
      const res = await fetch("/api/login-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert("Invalid owner credentials.");
      }
    });
  }

  const tradeRequestForm = document.getElementById("tradeRequestForm");
  if (tradeRequestForm) {
    tradeRequestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = document.getElementById("requestType").value.trim();
      const item = document.getElementById("requestItem").value.trim();
      const offer = document.getElementById("requestOffer").value.trim();
      const date = document.getElementById("requestDate").value;
      const note = document.getElementById("requestNote").value.trim();
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, item, offer, date, note }),
      });
      const data = await res.json();
      if (data.success) {
        tradeRequestForm.reset();
        loadRequests();
      } else {
        alert(data.error || "Failed to submit request.");
      }
    });
  }

  const requestList = document.getElementById("requestList");

  async function loadRequests() {
    if (!requestList) return;
    const res = await fetch("/api/requests");
    const requests = await res.json();
    const currentSession = await getSession();

    if (requests.length === 0) {
      requestList.innerHTML = "<p class='muted'>No trade requests yet.</p>";
      return;
    }

    requestList.innerHTML = requests.map((r, i) => {
      const statusClass = r.status === "Done" ? "badge done" : r.status === "Accepted" ? "badge accepted" : r.status === "Declined" ? "badge declined" : "badge";
      const ownerActions = currentSession.mode === "owner" ? `
        <div class="request-actions">
          <button onclick="handleRequest(${i}, 'accept')">Accept</button>
          <button onclick="handleRequest(${i}, 'decline')">Decline</button>
          <button onclick="handleRequest(${i}, 'done')">Done</button>
          <button onclick="deleteRequest(${i})">Delete</button>
        </div>` : "";
      return `
        <div class="receipt-card">
          <div class="receipt-header">
            <span class="receipt-ign">${escHtml(r.ign)}</span>
            <span class="${statusClass}">${escHtml(r.status)}</span>
          </div>
          <p><strong>Discord:</strong> ${escHtml(r.discord)}</p>
          <p><strong>Type:</strong> ${escHtml(r.type)}</p>
          <p><strong>Item:</strong> ${escHtml(r.item)}</p>
          <p><strong>Offer:</strong> ${escHtml(r.offer)}</p>
          ${r.date ? `<p><strong>Date:</strong> ${escHtml(r.date)}</p>` : ""}
          ${r.note ? `<p><strong>Note:</strong> ${escHtml(r.note)}</p>` : ""}
          ${r.handledBy ? `<p class="muted">Handled by: ${escHtml(r.handledBy)}</p>` : ""}
          ${ownerActions}
        </div>`;
    }).join("");
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.handleRequest = async function (index, action) {
    const res = await fetch(`/api/requests/${index}/${action}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      loadRequests();
    } else {
      alert(data.error || "Action failed.");
    }
  };

  window.deleteRequest = async function (index) {
    if (!confirm("Delete this trade request?")) return;
    const res = await fetch(`/api/requests/${index}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      loadRequests();
    } else {
      alert(data.error || "Delete failed.");
    }
  };

  loadRequests();
})();
