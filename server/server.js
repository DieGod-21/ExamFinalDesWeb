// server/server.js
// Archivo único de servidor para depuración de problemas de enrutamiento en Render.

const express = require("express");
const cors = require("cors");
const path = require("path");
const sql = require('mssql');
const config = require('./db');

const app = express();

// --- Middlewares de Configuración ---
app.use(cors());
app.use(express.json());
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/views', express.static(path.join(__dirname, '../views')));
app.use('/css', express.static(path.join(__dirname, '../views/css')));


// --- Middleware de Autenticación ---
const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ error: "Acceso no autorizado: Token no proporcionado." });
    }
    console.log("Middleware de autenticación: Token presente. Acceso permitido.");
    next();
};


// --- Rutas de la API ---

// Endpoint seguro para obtener el historial de chat
app.get("/api/historial", validateToken, async (req, res) => {
    try {
        console.log("Endpoint /api/historial: Conectando a SQL Server...");
        const pool = await sql.connect(config);
        console.log("Conexión exitosa, ejecutando query para historial...");
        
        const result = await pool.request().query(`
            SELECT 
                ID_Mensaje,
                Cod_Sala,
                Login_Emisor,
                Contenido,
                Fecha_Envio,
                Estado
            FROM dbo.Chat_Mensaje
            ORDER BY Fecha_Envio ASC
        `);
        
        console.log("Historial obtenido:", result.recordset.length);
        res.json(result.recordset);

    } catch (err) {
        console.error("Error SQL en /api/historial:", err.message);
        res.status(500).json({ 
            error: "Error del servidor al consultar el historial",
            detalle: err.message
        });
    }
});

// Endpoints antiguos (para referencia)
app.get("/mensajes", async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT Login_Emisor AS login_emisor, Contenido AS contenido, Fecha_Envio AS fecha_hora
            FROM dbo.Chat_Mensaje ORDER BY Fecha_Envio ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error consultando mensajes", detalle: err.message });
    }
});

app.get("/chat_mensaje", async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT ID_Mensaje, Cod_Sala, Login_Emisor, Contenido, Fecha_Envio, Estado
            FROM dbo.Chat_Mensaje ORDER BY Fecha_Envio ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error consultando mensajes de Chat_Mensaje", detalle: err.message });
    }
});


// --- Ruta Principal ---
app.get('/', (req, res) => {
    res.redirect('/views/login.html');
});


// --- Inicio del Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
    console.log("Rutas de API disponibles:");
    console.log("  - GET /api/historial (Protegida por token)");
});