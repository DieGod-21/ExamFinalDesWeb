const sql = require("mssql");

const config = {
    user: "usr_DesaWebDevUMG",
    password: "!ngGuast@360",
    server: "svr-sql-ctezo.southcentralus.cloudapp.azure.com",
    database: "db_DesaWebDevUMG",
    options: {
        encrypt: true,               // Azure requiere esto
        trustServerCertificate: true, // Cambiado para pruebas en Render
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

module.exports = config;
