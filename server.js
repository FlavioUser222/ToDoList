import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import sqlite3 from "sqlite3"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from "node-cron"
import fetch from "node-fetch";

const url = 'https://todolist-qwfq.onrender.com/tarefas'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())


const db = new sqlite3.Database("./db.sqlite")


app.listen(8080, () => {
    console.log("Servidor rodando")
})

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Tarefas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarefa VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )`)
})


app.get('/tarefas', (req, res) => {
    db.all(`SELECT * FROM Tarefas`, [], (err, rows) => {
        res.json(rows)
    })
})

app.post('/tarefa', (req, res) => {
    const data_criacao = new Date().toISOString()

    db.run(`INSERT INTO Tarefas (tarefa, categoria, data_criacao) VALUES (?, ?,?)`, [req.body.tarefa, req.body.categoria, data_criacao])

})

app.delete('/tarefa/:index', (req, res) => {
    db.run(`
        DELETE FROM Tarefas WHERE id == (?)`, [req.params.index])
})

app.put('/tarefa/:index', (req, res) => {
    db.run(`UPDATE Tarefas SET tarefa = ? WHERE id = ?`, [req.body.tarefa, req.params.index])
})

app.get('/home', (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    res.sendFile("index.html", {root: __dirname})

})

cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(url);
      const status = res.status;
      console.log(`[${new Date().toLocaleTimeString()}] Ping enviado! Status: ${status}`);
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erro ao enviar ping:`, error);
    }
  });








