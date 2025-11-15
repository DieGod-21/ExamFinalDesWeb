const sql = require("mssql");

const config = {
    user: "usr_DesaWebDevUMG",
    password: "!ngGuast@360",
    server: "svr-sql-ctezo.southcentralus.cloudapp.azure.com",
    database: "db_DesaWebDevUMG",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;    