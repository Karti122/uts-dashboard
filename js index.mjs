import http from "http";
import { exec } from "child_process";

const PORT = 3000;

const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>🛒 Dashboard Toko Barang</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; background: #f4f6f9; margin: 0; }
    .sidebar {
      width: 220px; height: 100vh;
      background: #343a40; color: white;
      position: fixed; top: 0; left: 0; padding-top: 20px;
    }
    .sidebar h3 { text-align: center; margin-bottom: 30px; }
    .sidebar button {
      width: 180px; margin: 10px 20px;
      border: none; padding: 10px; border-radius: 5px;
      background: #495057; color: white; transition: 0.3s;
    }
    .sidebar button:hover { background: #17a2b8; }
    .content { margin-left: 240px; padding: 20px; }
    .chart-container {
      background: white; padding: 20px; border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-bottom: 25px;
    }
    table { text-align: center; }
  </style>
</head>
<body>
  <div class="sidebar">
    <h3>🛍️ TOKO BARANG</h3>
    <button onclick="tampilkanDashboard()">📊 Dashboard</button>
    <button onclick="tampilkanBarang()">📋 Data Barang</button>
    <button onclick="tampilkanKategori()">📦 Data Kategori</button>
    <button onclick="tampilkanPenjualan()">💰 Data Penjualan</button>
  </div>

  <div class="content">
    <div id="dashboardSection">
      <h2 class="mb-4">📈 Statistik Penjualan & Stok</h2>
      <div class="row">
        <div class="col-md-6 chart-container"><canvas id="chartPenjualan"></canvas></div>
        <div class="col-md-6 chart-container"><canvas id="chartStok"></canvas></div>
        <div class="col-md-6 chart-container"><canvas id="chartKategori"></canvas></div>
        <div class="col-md-6 chart-container"><canvas id="chartKeuntungan"></canvas></div>
      </div>
    </div>

    <div id="tabelSection" style="display:none;" class="chart-container">
      <h4 class="mb-3">📋 Data Barang</h4>
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>No</th><th>Nama Barang</th><th>Kategori</th><th>Harga</th>
            <th>Stok</th><th>Terjual</th><th>Keuntungan</th>
          </tr>
        </thead>
        <tbody id="tbodyBarang"></tbody>
      </table>
    </div>
  </div>

  <script>
    const dataBarang = [
      { nama: "Beras 5kg", kategori: "Sembako", harga: 65000, stok: 120, terjual: 85 },
      { nama: "Gula Pasir 1kg", kategori: "Sembako", harga: 15000, stok: 80, terjual: 60 },
      { nama: "Minyak Goreng 2L", kategori: "Sembako", harga: 32000, stok: 50, terjual: 40 },
      { nama: "Sabun Mandi", kategori: "Kebutuhan Rumah", harga: 7000, stok: 150, terjual: 110 },
      { nama: "Shampoo Botol", kategori: "Kebutuhan Rumah", harga: 18000, stok: 60, terjual: 50 },
      { nama: "Kopi Bubuk 200g", kategori: "Minuman", harga: 25000, stok: 90, terjual: 75 },
      { nama: "Teh Celup 25pcs", kategori: "Minuman", harga: 12000, stok: 70, terjual: 65 },
      { nama: "Air Mineral 1.5L", kategori: "Minuman", harga: 6000, stok: 200, terjual: 180 }
    ];

    dataBarang.forEach(d => d.keuntungan = d.harga * d.terjual * 0.1);

    function tampilkanDashboard() {
      document.getElementById("dashboardSection").style.display = "block";
      document.getElementById("tabelSection").style.display = "none";
      buatGrafik();
    }

    function tampilkanBarang() {
      document.getElementById("dashboardSection").style.display = "none";
      document.getElementById("tabelSection").style.display = "block";
      isiTabel(dataBarang);
    }

    function tampilkanKategori() {
      document.getElementById("dashboardSection").style.display = "none";
      document.getElementById("tabelSection").style.display = "block";
      const kategori = [...new Set(dataBarang.map(d => d.kategori))];
      const kategoriData = kategori.map(k => {
        const total = dataBarang.filter(d => d.kategori === k)
          .reduce((sum, d) => sum + d.terjual, 0);
        return { nama: k, kategori: k, harga: "-", stok: "-", terjual: total, keuntungan: "-" };
      });
      isiTabel(kategoriData);
    }

    function tampilkanPenjualan() {
      document.getElementById("dashboardSection").style.display = "none";
      document.getElementById("tabelSection").style.display = "block";
      isiTabel(dataBarang);
    }

    function isiTabel(data) {
      const tbody = document.getElementById("tbodyBarang");
      tbody.innerHTML = "";
      data.forEach((d, i) => {
        tbody.innerHTML += \`
          <tr>
            <td>\${i + 1}</td>
            <td>\${d.nama}</td>
            <td>\${d.kategori}</td>
            <td>\${d.harga === "-" ? "-" : "Rp " + d.harga.toLocaleString()}</td>
            <td>\${d.stok}</td>
            <td>\${d.terjual}</td>
            <td>\${d.keuntungan === "-" ? "-" : "Rp " + d.keuntungan.toLocaleString()}</td>
          </tr>
        \`;
      });
    }

    function buatGrafik() {
      const labels = dataBarang.map(d => d.nama);
      const penjualan = dataBarang.map(d => d.terjual);
      const stok = dataBarang.map(d => d.stok);
      const keuntungan = dataBarang.map(d => d.keuntungan);
      const kategori = [...new Set(dataBarang.map(d => d.kategori))];
      const warna = labels.map(() => 'hsl(' + Math.random() * 360 + ',70%,60%)');

      Chart.helpers.each(Chart.instances, (inst) => inst.destroy());

      new Chart(document.getElementById("chartPenjualan"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Terjual", data: penjualan, backgroundColor: warna }] },
        options: { plugins: { title: { display: true, text: "Penjualan Barang" } }, responsive: true }
      });

      new Chart(document.getElementById("chartStok"), {
        type: "line",
        data: { labels, datasets: [{ label: "Stok", data: stok, borderColor: "blue", fill: false }] },
        options: { plugins: { title: { display: true, text: "Stok Barang" } }, responsive: true }
      });

      const kategoriData = kategori.map(k => dataBarang.filter(d => d.kategori === k).length);
      new Chart(document.getElementById("chartKategori"), {
        type: "pie",
        data: { labels: kategori, datasets: [{ data: kategoriData, backgroundColor: warna.slice(0, kategori.length) }] },
        options: { plugins: { title: { display: true, text: "Kategori Barang" } }, responsive: true }
      });

      new Chart(document.getElementById("chartKeuntungan"), {
        type: "doughnut",
        data: { labels, datasets: [{ data: keuntungan, backgroundColor: warna }] },
        options: { plugins: { title: { display: true, text: "Keuntungan Barang (10%)" } }, responsive: true }
      });
    }

    tampilkanDashboard();
  </script>
</body>
</html>
`;

// Jalankan server HTTP
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(PORT);
exec(`start http://localhost:${PORT}`);
console.log("✅ Dashboard TOKO BARANG berjalan di http://localhost:3000");
