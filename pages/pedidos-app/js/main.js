document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnMostrarModal").addEventListener("click", mostrarModalProyecto);
    document.getElementById("filtroServicio").addEventListener("change", filtrarTabla);
    cargarPedidos();
  
    // Cargar modal y luego opciones fijas
    fetch("modal/modalProyecto.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("modalContainer").innerHTML = html;
        cargarOpcionesEstáticas(); // Opciones cargadas desde el código
      });
  });
  
  function mostrarModalProyecto() {
    const seleccionados = Array.from(document.querySelectorAll(".seleccion-checkbox:checked"));
    const ids = seleccionados.map(cb => cb.closest('tr').children[0].textContent.trim());
    const resumen = ids.length > 0 ? ids.join("<br>") : "No hay ningún lote seleccionado.";
    document.getElementById("resumenSeleccionados").innerHTML = resumen;
    $('#modalProyecto').modal('show');
  }
  
  function guardarProyecto() {
    const nombre = document.getElementById("nombreProyecto").value;
    const clasificacion = document.getElementById("clasificacionProyecto").value;
    const financiamiento = document.getElementById("financiamientoProyecto").value;
    const registro = document.getElementById("registroOposicionProyecto").value;
    const prioridad = document.getElementById("prioridadProyecto").value;
    const asignado = document.getElementById("asignadoProyecto").value;
    const supervisor = document.getElementById("supervisorProyecto").value;
    const estado = document.getElementById("estadoProyecto").value;
  
    const seleccionados = Array.from(document.querySelectorAll(".seleccion-checkbox:checked"));
    const ids = seleccionados.map(cb => cb.closest('tr').children[0].textContent.trim());
  
    if (!nombre || ids.length === 0) {
      alert("Completá el nombre del proyecto y seleccioná al menos un lote.");
      return;
    }
  
    const payload = {
      ids,
      nombreProyecto: nombre,
      clasificacion,
      financiamiento,
      registroOposicion: registro,
      prioridad,
      etapaActual: "Asignado",
      estadoProyecto: estado,
      asignado,
      supervisor,
      fechaComienzo: new Date().toISOString()
    };
  
    const spinner = document.getElementById("spinnerProyecto");
    const btnGuardar = document.querySelector("#modalProyecto .btn-primary");
  
    spinner.classList.remove("d-none");
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";
  
    fetch("https://script.google.com/macros/s/AKfycbyv-DxZC4ezGazg15o5Tov5evht8zPY8WO6_wYdaRVuAr-t6feieEsm4lcXVBhXk98/exec", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).finally(() => {
      spinner.classList.add("d-none");
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = `<i class='fas fa-check mr-2'></i>Guardar`;
      alert("✅ Proyecto guardado exitosamente.");
      $('#modalProyecto').modal('hide');
      document.getElementById("formProyecto").reset();
    });
  }
  
  function cargarOpcionesEstáticas() {
    const opciones = {
      clasificacionProyecto: ["Infraestructura", "Mantenimiento", "Vivienda"],
      financiamientoProyecto: ["Nacional", "Provincial", "Municipal"],
      registroOposicionProyecto: ["Sí", "No"],
      prioridadProyecto: ["Alta", "Media", "Baja", "Urgente"],
      asignadoProyecto: ["Juan", "María", "Gley", "Lu", "Rafa"],
      supervisorProyecto: ["Gley", "Mario", "Laura", "Sofía"],
      estadoProyecto: ["Planificado", "En curso", "Finalizado", "Cancelado"]
    };
  
    for (const [id, valores] of Object.entries(opciones)) {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">Seleccionar</option>';
        valores.forEach(valor => {
          const option = document.createElement("option");
          option.value = valor;
          option.textContent = valor;
          select.appendChild(option);
        });
      }
    }
  }
  