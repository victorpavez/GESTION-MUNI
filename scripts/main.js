document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        const proyectos = data.proyectos;
        renderKPIs(proyectos);
        renderTabla(proyectos);
        renderGrafico(proyectos);
      })
      .catch(error => {
        console.error("Error al cargar data.json:", error);
      });
  });
  