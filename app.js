const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pharma_db",
});

// Serve Frontend
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Dashboard</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        input { margin: 5px; padding: 5px; }
        button { padding: 5px 10px; margin: 5px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: center; }
        .delete { background: red; color: white; }
      </style>
    </head>

    <body>
      <h2>Pharma Dashboard</h2>

      <input id="company" placeholder="Company Name"/>
      <input id="gstin" placeholder="GSTIN"/>
      <button onclick="addCompany()">Add</button>

      <h3>Total Companies: <span id="count">0</span></h3>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>GSTIN</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="table"></tbody>
      </table>

      <script>
        async function fetchData() {
          const res = await fetch('/companies');
          const data = await res.json();

          document.getElementById("count").innerText = data.length;

          let rows = "";
          data.forEach(item => {
            rows += \`
              <tr>
                <td>\${item.chain_id}</td>
                <td>\${item.company_name}</td>
                <td>\${item.gstin}</td>
                <td>
                  <button class="delete" onclick="deleteCompany(\${item.chain_id})">Delete</button>
                </td>
              </tr>
            \`;
          });

          document.getElementById("table").innerHTML = rows;
        }

        async function addCompany() {
          const company = document.getElementById("company").value;
          const gstin = document.getElementById("gstin").value;

          await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_name: company, gstin: gstin })
          });

          fetchData();
        }

        async function deleteCompany(id) {
          await fetch('/delete/' + id, { method: 'DELETE' });
          fetchData();
        }

        fetchData();
      </script>
    </body>
    </html>
  `);
});

// APIs
app.get("/companies", (req, res) => {
  db.query("SELECT * FROM chains", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

app.post("/add", (req, res) => {
  const { company_name, gstin } = req.body;
  db.query(
    "INSERT INTO chains (company_name, gstin, is_active) VALUES (?, ?, 1)",
    [company_name, gstin],
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  db.query("DELETE FROM chains WHERE chain_id=?", [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send("Deleted");
  });
});

// Start Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));