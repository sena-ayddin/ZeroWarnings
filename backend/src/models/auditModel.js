// Audit_Logs tablosu (FR-11, NFR-08). Mutlaka ilgili işlemle aynı transaction (conn) içinde çağrılır.
const log = (conn, { user_id = null, entity_type, entity_id, action, old_value = null, new_value = null }) =>
  conn.query(
    'INSERT INTO Audit_Logs (user_id, entity_type, entity_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
    [
      user_id, entity_type, entity_id, action,
      old_value === null ? null : JSON.stringify(old_value),
      new_value === null ? null : JSON.stringify(new_value)
    ]
  );

module.exports = { log };