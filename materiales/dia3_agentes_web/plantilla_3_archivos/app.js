// Datos simulados de aprendices
const aprendices = [
  { id: 1, nombre: "Andrés Gómez", ficha: "ADSO-2871", evidencias: 8, total: 8, asistencia: 95, estado: "Al día" },
  { id: 2, nombre: "Laura Morales", ficha: "ADSO-2871", evidencias: 7, total: 8, asistencia: 88, estado: "En progreso" },
  { id: 3, nombre: "Carlos Rojas", ficha: "ADSO-2871", evidencias: 4, total: 8, asistencia: 72, estado: "Requiere apoyo" },
  { id: 4, nombre: "Diana Castillo", ficha: "ADSO-2872", evidencias: 8, total: 8, asistencia: 100, estado: "Al día" },
  { id: 5, nombre: "Miguel Vélez", ficha: "ADSO-2872", evidencias: 6, total: 8, asistencia: 85, estado: "En progreso" },
  { id: 6, nombre: "Valentina Duarte", ficha: "ADSO-2872", evidencias: 8, total: 8, asistencia: 98, estado: "Al día" },
  { id: 7, nombre: "Julián Parra", ficha: "ADSO-2871", evidencias: 3, total: 8, asistencia: 65, estado: "Requiere apoyo" },
  { id: 8, nombre: "Sofía Cárdenas", ficha: "ADSO-2872", evidencias: 7, total: 8, asistencia: 92, estado: "En progreso" }
];

// Inicialización de la gráfica Chart.js
let chartInstance = null;

function renderizarGrafica(datos) {
  const ctx = document.getElementById("performanceChart").getContext("2d");
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.map(a => a.nombre.split(" ")[0]),
      datasets: [
        {
          label: "% Asistencia",
          data: datos.map(a => a.asistencia),
          backgroundColor: "#2d5a4c",
          borderRadius: 6
        },
        {
          label: "Evidencias (% sobre 8)",
          data: datos.map(a => Math.round((a.evidencias / a.total) * 100)),
          backgroundColor: "#93c5fd",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => v + "%" }
        }
      }
    }
  });
}

function obtenerClaseBadge(estado) {
  switch (estado) {
    case "Al día": return "badge-success";
    case "En progreso": return "badge-info";
    case "Requiere apoyo": return "badge-warning";
    default: return "";
  }
}

function renderizarTabla(datos) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">No se encontraron aprendices con ese criterio.</td></tr>`;
    return;
  }

  datos.forEach(ap => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${ap.nombre}</strong></td>
      <td><code>${ap.ficha}</code></td>
      <td>${ap.evidencias} / ${ap.total}</td>
      <td>${ap.asistencia}%</td>
      <td><span class="badge ${obtenerClaseBadge(ap.estado)}">${ap.estado}</span></td>
      <td><button class="action-btn" onclick="alert('Notificación enviada a ${ap.nombre}')">Contactar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarDatos() {
  const busqueda = document.getElementById("searchInput").value.toLowerCase();
  const estadoSeleccionado = document.getElementById("statusFilter").value;

  const filtrados = aprendices.filter(ap => {
    const coincideTexto = ap.nombre.toLowerCase().includes(busqueda) || ap.ficha.toLowerCase().includes(busqueda);
    const coincideEstado = estadoSeleccionado === "todos" || ap.estado === estadoSeleccionado;
    return coincideTexto && coincideEstado;
  });

  renderizarTabla(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarTabla(aprendices);
  renderizarGrafica(aprendices);

  document.getElementById("searchInput").addEventListener("input", filtrarDatos);
  document.getElementById("statusFilter").addEventListener("change", filtrarDatos);
});
