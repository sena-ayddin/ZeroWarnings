const API_BASE_URL = "http://localhost:3000/api";

async function createTicketAPI(ticketData) {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(ticketData)
  });

  if (!response.ok) {
    throw new Error("A server error occurred while creating the ticket.");
  }
  return await response.json();
}

async function getTicketsAPI() {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ticket list from the server.");
  }
  return await response.json();
}

async function submitFeedbackAPI(feedbackData) {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(feedbackData)
  });

  if (!response.ok) {
    throw new Error("Failed to submit survey feedback.");
  }
  return await response.json();
}
// Append these helpers to the existing frontend/js/api.js (do not replace the file).
async function getFeedbackResultsAPI() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error("CSAT sonuçları alınamadı.");
  }
  return await response.json();
}

async function getSlaAlertsAPI() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/sla/alerts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error("SLA uyarıları alınamadı.");
  }
  return await response.json();
}
