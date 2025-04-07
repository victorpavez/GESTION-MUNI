function mostrarSeccion(seccion) {
    document.querySelectorAll('#menu-tabs .nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`#menu-tabs .nav-link[onclick*="${seccion}"]`).classList.add('active');
  
    document.getElementById('seccion-proyecto').style.display = seccion === 'proyectos' ? 'block' : 'none';
    document.getElementById('seccion-kpis').style.display = seccion === 'kpis' ? 'block' : 'none';
    document.getElementById('seccion-colaboradores').style.display = (seccion === 'responsables' || seccion === 'proyectistas') ? 'block' : 'none';
    document.getElementById('filtro').style.display = seccion === 'proyectos' ? 'block' : 'none';
  }
  
  function toggleTreeMenu(el) {
    const parent = el.closest('.nav-item');
    parent.classList.toggle('menu-open');
    const submenu = parent.querySelector('.nav-treeview');
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
  }
  