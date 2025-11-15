const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require("path");
const config = require("./db");

const app = express();

// ==============================
// 🔥 CORS CORRECTO PARA RENDER
// ==============================
app.use(
    cors({
        origin: [
            "https://examfinaldesweb.onrender.com",
            "https://desarrollowebfinal.onrender.com",
            "http://localhost:5500",
            "http://localhost:3000"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Necesario para preflight (Express 5)
app.options("(.*)", cors());

// ==============================
// Middlewares
// ==============================
app.use(express.json());

// Servir archivos estáticos
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/views", express.static(path.join(__dirname, "../views")));
app.use("/css", express.static(path.join(__dirname, "../views/css")));

// Página principal
app.get("/", (req, res) => {
    res.redirect("/views/login.html");
});

// ==============================
// API – Obtener mensajes
// ==============================
app.get("/api/mensajes-chat/mensajes", async (req, res) => {
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
        console.error("❌ Error SQL:", err);
        res.status(500).json({ error: "Error consultando mensajes en SQL" });
    }
});

// ==============================
// Levantar servidor
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});
