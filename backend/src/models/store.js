// Geçici in-memory veri katmanı (Users, Tickets).
// Alan adları database_design.md ile uyumludur.
// Elif'in schema.sql'i bağlanınca sadece bu dosya DB sorgularıyla değiştirilecek.
const bcrypt = require('bcryptjs');

const users = [
  { id: 1, name: 'Senanur Aydın', email: 'admin@zerowarnings.com', passwordHash: bcrypt.hashSync('Admin123!', 10), role: 'Administrator' },
  { id: 2, name: 'Test Teknisyen', email: 'tech@zerowarnings.com', passwordHash: bcrypt.hashSync('Tech123!', 10), role: 'Technician' },
  { id: 3, name: 'Test Çalışan', email: 'employee@zerowarnings.com', passwordHash: bcrypt.hashSync('Emp123!', 10), role: 'Employee' }
];

const tickets = [];

let ticketId = 0;
let incCounter = 1024; // INC-1024
let chgCounter = 872;  // CHG-0872
let userCounter = users.length;

const nextTicket = (requestType) => {
  const number = requestType === 'Change Request'
    ? `CHG-${String(chgCounter++).padStart(4, '0')}`
    : `INC-${incCounter++}`;
  return { ticket_id: ++ticketId, ticket_number: number };
};

module.exports = {
  users,
  tickets,
  nextTicket,
  nextUserId: () => ++userCounter
};