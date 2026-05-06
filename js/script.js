
let currentSession = { mode: "guest" };

async function fetchSession() {
  const res = await fetch("/api/session");
  currentSession = await res.json();
  applySession();
}

function applySession() {
  const title = document.getElementById("modeTitle");
  const desc = document.getElementById("modeDesc");

  if (!title || !desc) return;

  if (currentSession.mode === "owner") {
    title.textContent = "Periwinkle Team Owner";
    desc.textContent = "Owner access enabled.";
  } else if (currentSession.mode === "viewer") {
    title.textContent = "Viewer: " + currentSession.ign;
    desc.textContent = "Logged in as viewer.";
  } else {
    title.textContent = "Guest Mode";
    desc.textContent = "Please log in.";
  }
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

async function renderRequests() {
  const list = document.getElementById("requestList");

  if (!list) return;

  const res = await fetch("/api/requests");
  const requests = await res.json();

  list.innerHTML = "";

  requests.forEach((request, index) => {
    let ownerActions = "";

    if (currentSession.mode === "owner") {
      if (request.status === "Pending") {
        ownerActions += `<button onclick="updateRequest(${index}, 'accept')">Accept</button>`;
        ownerActions += `<button class="owner-danger" onclick="updateRequest(${index}, 'decline')">Decline</button>`;
      }

      if (request.status === "Accepted") {
        ownerActions += `<button onclick="updateRequest(${index}, 'done')">Mark Done</button>`;
      }

      ownerActions += `<button class="owner-danger" onclick="deleteRequest(${index})">Delete</button>`;
    }

    const card = document.createElement("article");

    card.className = "receipt-card";

    card.innerHTML = `
      <div class="receipt-top">
        <span>Request #${String(index + 1).padStart(3, "0")}</span>
        <span class="status-pill ${statusClass(request.status)}">${request.status}</span>
      </div>

      <h3>${request.item}</h3>

      <div class="receipt-row"><span>Type</span><strong>${request.type}</strong></div>
      <div class="receipt-row"><span>Minecraft IGN</span><strong>${request.ign}</strong></div>
      <div class="receipt-row"><span>Discord</span><strong>${request.discord}</strong></div>
      <div class="receipt-row"><span>Offer</span><strong>${request.offer}</strong></div>
      <div class="receipt-row"><span>Date</span><strong>${request.date}</strong></div>

      <p class="receipt-note">"${request.note}"</p>

      <div class="receipt-actions">
        ${ownerActions}
      </div>
    `;

    list.appendChild(card);
  });
}

async function updateRequest(index, action) {
  await fetch(`/api/requests/${index}/${action}`, {
    method: "POST"
  });

  renderRequests();
}

async function deleteRequest(index) {
  await fetch(`/api/requests/${index}`, {
    method: "DELETE"
  });

  renderRequests();
}

const viewerLoginForm = document.getElementById("viewerLoginForm");

if (viewerLoginForm) {
  viewerLoginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const ign = document.getElementById("viewerIgn").value;
    const discord = document.getElementById("viewerDiscord").value;

    await fetch("/api/login-viewer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ign,
        discord
      })
    });

    window.location.href = "trades.html";
  });
}

const ownerLoginForm = document.getElementById("ownerLoginForm");

if (ownerLoginForm) {
  ownerLoginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("ownerUsername").value;
    const password = document.getElementById("ownerPassword").value;

    const res = await fetch("/api/login-owner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    if (res.ok) {
      window.location.href = "trades.html";
    } else {
      alert("Wrong owner login.");
    }
  });
}

const tradeRequestForm = document.getElementById("tradeRequestForm");

if (tradeRequestForm) {
  tradeRequestForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: document.getElementById("requestType").value,
        item: document.getElementById("requestItem").value,
        offer: document.getElementById("requestOffer").value,
        date: document.getElementById("requestDate").value,
        note: document.getElementById("requestNote").value
      })
    });

    tradeRequestForm.reset();
    renderRequests();
  });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch("/api/logout", {
      method: "POST"
    });

    window.location.href = "access.html";
  });
}

fetchSession();
renderRequests();
