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
