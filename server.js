/**
 * Custom CAP Server
 * Production: HANA Cloud (HDI Container)
 * Development: SQLite in-memory
 */
const cds = require('@sap/cds');

module.exports = cds.server;