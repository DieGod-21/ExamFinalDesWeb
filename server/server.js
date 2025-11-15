const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require("path");
const config = require("./db");

const app = express();

// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Archivos estáticos
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/views', express.static(path.join(__dirname, '../views')));
app.use('/css', express.static(path.join(__dirname, '../views/css')));

// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/views/login.html');
});

// Endpoint para obtener mensajes
app.get("/mensajes", async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                Login_Emisor AS login_emisor,
                Contenido AS contenido,
                Fecha AS fecha_hora
            FROM dbo.Chat_Mensaje
            ORDER BY Fecha ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error SQL:", err);
        res.status(500).json({ error: "Error consultando mensajes" });
    }
});

// Puerto Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en puerto", PORT));
