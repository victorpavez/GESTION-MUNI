function cargarOpcionesDesdeCSV() {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSuZNZgxCwro2lIaDsQXmF8r08uOAVShfag2aysWucZa0_g0bQWVxasBzUGFj_yHKXJhsFK-G6iIZpH/pub?gid=0&single=true&output=csv")
      .then(res => res.text())
      .then(text => {
        const rows = text.trim().split("\n").map(row => row.split(","));
        const encabezados = rows[0].map(h => h.trim().toUpperCase());
        const columnas = {};
  
        // Inicializar sets vacíos para cada encabezado
        encabezados.forEach(encabezado => {
          columnas[encabezado] = new Set();
        });
  
        // Recorrer todas las filas
        rows.slice(1).forEach(fila => {
          fila.forEach((valor, i) => {
            const encabezado = encabezados[i];
            const limpio = valor
              .normalize("NFD")                       // quita tildes invisibles
              .replace(/[\u0300-\u036f]/g, "")
              .trim();                               // quita espacios invisibles
  
            if (limpio) columnas[encabezado].add(limpio);
          });
        });
  
        // Mapeo: columna del CSV → id del <select>
        const mapeoIds = {
          "CLASIFICACION": "clasificacionProyecto",
          "FINANCIAMIENTO": "financiamientoProyecto",
          "REGISTRO DE OPOSICION": "registroOposicionProyecto",
          "PRIORIDAD": "prioridadProyecto",
          "ASIGNADO": "asignadoProyecto",
          "SUPERVISOR TECNICO": "supervisorProyecto",
          "ESTADO DEL PROYECTO": "estadoProyecto"
        };
  
        // Llenar cada select
        for (const [campo, opciones] of Object.entries(columnas)) {
          const id = mapeoIds[campo];
          const select = document.getElementById(id);
          console.log(`🟢 ${campo}:`, Array.from(opciones)); // Para debug
  
          if (select) {
            select.innerHTML = '<option value="">Seleccionar</option>';
            opciones.forEach(op => {
              const option = document.createElement("option");
              option.value = op;
              option.textContent = op;
              select.appendChild(option);
            });
          }
        }
      })
      .catch(error => {
        console.error("❌ Error al cargar opciones desde CSV:", error);
      });
  }
  