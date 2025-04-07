// Cargar y procesar datos desde data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    renderKPIs(data.proyectos);
    renderTabla(data.proyectos);
    renderGrafico(data.proyectos);
    cargarTipos(data.proyectos);
    document.getElementById("fechaActual").textContent = new Date().toLocaleDateString();
  });

function renderKPIs(proyectos) {
  const kpisContainer = document.getElementById("kpis");
  kpisContainer.innerHTML = "";

  const total = proyectos.length;
  const finalizados = proyectos.filter(p => p.estado === "Finalizado").length;
  const enCurso = proyectos.filter(p => p.estado === "En curso").length;

  const kpis = [
    { label: "Total de Proyectos", valor: total, icon: "fas fa-list" },
    { label: "Finalizados", valor: finalizados, icon: "fas fa-check-circle text-success" },
    { label: "En curso", valor: enCurso, icon: "fas fa-spinner text-warning" },
  ];

  kpis.forEach(kpi => {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="info-box">
        <span class="info-box-icon bg-info elevation-1"><i class="${kpi.icon}"></i></span>
        <div class="info-box-content">
          <span class="info-box-text">${kpi.label}</span>
          <span class="info-box-number">${kpi.valor}</span>
        </div>
      </div>`;
    kpisContainer.appendChild(col);
  });
}

function renderTabla(proyectos) {
  const thead = document.querySelector("table thead tr");
  const tbody = document.querySelector("table tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headers = ["id", "nombre", "tipo", "estado", "prioridad", "fechaComienzo", "avanceFisico", "avanceFinanciero"];
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h.charAt(0).toUpperCase() + h.slice(1);
    thead.appendChild(th);
  });

  proyectos.forEach(p => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = p[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderGrafico(proyectos) {
  const ctx = document.getElementById("graficoResponsables").getContext("2d");
  const responsables = {};

  proyectos.forEach(p => {
    const r = p.responsableTecnico;
    responsables[r] = responsables[r] || { total: 0, avance: 0 };
    responsables[r].total++;
    responsables[r].avance += p.avanceFisico;
  });

  const labels = Object.keys(responsables);
  const data = labels.map(r => (responsables[r].avance / responsables[r].total).toFixed(2));

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '% Avance Físico Promedio',
        data,
        backgroundColor: '#1976d2'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function cargarTipos(proyectos) {
  const select = document.getElementById("filtroTipo");
  const tipos = [...new Set(proyectos.map(p => p.tipo))];
  tipos.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    select.appendChild(option);
  });
}

function filtrarPorTipo() {
  const tipo = document.getElementById("filtroTipo").value;
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      const proyectos = tipo === "TODOS" ? data.proyectos : data.proyectos.filter(p => p.tipo === tipo);
      renderKPIs(proyectos);
      renderTabla(proyectos);
      renderGrafico(proyectos);
    });
}