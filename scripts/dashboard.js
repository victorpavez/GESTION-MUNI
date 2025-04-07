const kpiGrupos = {
    general: proyectos => [
      { label: "Total de Proyectos", valor: proyectos.length, icon: "fas fa-list", filtro: "TODOS" },
      { label: "En curso", valor: proyectos.filter(p => p.estado === "En curso").length, icon: "fas fa-spinner text-warning", filtro: "En curso" },
      { label: "Finalizados", valor: proyectos.filter(p => p.estado === "Finalizado").length, icon: "fas fa-check-circle text-success", filtro: "Finalizado" }
    ],
  
    tiempo: proyectos => {
      const enTiempo = proyectos.filter(p => p.estado === "En curso" && !p.retrasado).length;
      const atrasados = proyectos.filter(p => p.estado === "En curso" && p.retrasado).length;
  
      return [
        { label: "Proyectos en tiempo", valor: enTiempo, icon: "fas fa-clock text-success", filtro: "tiempo-ok" },
        { label: "Proyectos atrasados", valor: atrasados, icon: "fas fa-clock text-danger", filtro: "tiempo-error" }
      ];
    },
  
    gestion: proyectos => [
      { label: "En espera Técnica", valor: 5, icon: "fas fa-tools" },
      { label: "En espera Legal", valor: 2, icon: "fas fa-gavel" },
      { label: "En espera Económica", valor: 4, icon: "fas fa-coins" },
      { label: "En espera Contrataciones", valor: 3, icon: "fas fa-file-signature" },
      { label: "En ejecución", valor: 6, icon: "fas fa-play-circle text-primary" }
    ],
  
    contrataciones: proyectos => [
      { label: "Contratos aprobados", valor: proyectos.filter(p => p.estadoContrato === "aprobado").length, icon: "fas fa-file-contract text-success" },
      { label: "Contratos pendientes", valor: proyectos.filter(p => p.estadoContrato === "pendiente").length, icon: "fas fa-hourglass-half text-warning" },
      { label: "Contratos rechazados", valor: proyectos.filter(p => p.estadoContrato === "rechazado").length, icon: "fas fa-times-circle text-danger" }
    ],
  
    recursos: proyectos => [
      { label: "Tareas por responsable", valor: "12.4", icon: "fas fa-user-cog" },
      { label: "Activos por técnico", valor: "3.2", icon: "fas fa-users" }
    ]
  };
  
  function renderKPIs(grupo, proyectos) {
    const kpisContainer = document.getElementById("kpis");
    kpisContainer.innerHTML = "";
  
    const kpis = kpiGrupos[grupo](proyectos);
  
    kpis.forEach(kpi => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="info-box kpi-filtro ${kpi.filtro ? '' : 'no-interactive'}" ${kpi.filtro ? `data-filtro="${kpi.filtro}"` : ""} style="cursor: pointer;">
          <span class="info-box-icon bg-info elevation-1"><i class="${kpi.icon}"></i></span>
          <div class="info-box-content">
            <span class="info-box-text">${kpi.label}</span>
            <span class="info-box-number">${kpi.valor}</span>
          </div>
        </div>`;
      kpisContainer.appendChild(col);
    });
  
    document.querySelectorAll('.kpi-filtro[data-filtro]').forEach(box => {
      box.addEventListener('click', function () {
        const estado = this.getAttribute('data-filtro');
  
        document.querySelectorAll('.kpi-filtro').forEach(b => b.classList.remove('kpi-activo'));
        this.classList.add('kpi-activo');
  
        document.getElementById("buscadorProyectos").value = "";
        filtrarProyectosPorEstado(estado);
        document.querySelector('#seccion-proyecto').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
  
  function filtrarProyectosPorEstado(estado) {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        let proyectos = data.proyectos;
  
        if (estado === "tiempo-ok") {
          proyectos = proyectos.filter(p => p.estado === "En curso" && !p.retrasado);
        } else if (estado === "tiempo-error") {
          proyectos = proyectos.filter(p => p.estado === "En curso" && p.retrasado);
        } else if (estado !== "TODOS") {
          proyectos = proyectos.filter(p => p.estado === estado);
        }
  
        renderTabla(proyectos);
      });
  }
  
  function renderTabla(proyectos) {
    const thead = document.querySelector("#tablaProyectos thead tr");
    const tbody = document.querySelector("#tablaProyectos tbody");
  
    thead.innerHTML = "";
    tbody.innerHTML = "";
  
    const headers = ["id", "nombre", "tipo", "estado", "responsable", "fechaComienzo"];
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h.charAt(0).toUpperCase() + h.slice(1);
      thead.appendChild(th);
    });
  
    proyectos.forEach(p => {
      const tr = document.createElement("tr");
      headers.forEach(h => {
        const td = document.createElement("td");
        td.textContent = p[h] || "";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
      .then(r => r.json())
      .then(data => {
        const proyectos = data.proyectos;
        renderKPIs("general", proyectos);
        renderTabla(proyectos);
  
        document.querySelectorAll(".kpi-tab").forEach(btn => {
          btn.addEventListener("click", () => {
            document.querySelectorAll(".kpi-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const grupo = btn.getAttribute("data-grupo");
  
            document.querySelectorAll('.kpi-filtro').forEach(b => b.classList.remove('kpi-activo'));
            renderKPIs(grupo, proyectos);
          });
        });
      });
  });
  