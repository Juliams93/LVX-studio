(() => {
  const header = document.querySelector('header');
  if (!header) return;
  let scheduled = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    scheduled = false;
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pageshow', update);
  update();
})();

(() => {
  const launcher = document.getElementById('robot-launcher');
  const panel = document.getElementById('robot-panel');
  const close = document.getElementById('robot-close');
  const log = document.getElementById('robot-log');
  const input = document.getElementById('robot-input');
  const form = document.getElementById('robot-form');
  if (!launcher || !panel || !close || !log || !input || !form) return;
  const routes = [
    { id: 'nexusai', label: 'NexusAI', words: ['nexus', 'plataforma ia'] },
    { id: 'reservas-empresas', label: 'Reservas para empresas', words: ['reservas para empresas', 'reservas'] },
    { id: 'mas-proyectos', label: 'Diseño de producto', words: ['figma'] },
    { id: 'familyhome', label: 'FamilyHOME', words: ['familyhome', 'family home'] },
    { id: 'safewalk', label: 'SafeWalk', words: ['safewalk', 'safe walk'] },
    { id: 'fitreserve', label: 'FitReserve Gym', words: ['fitreserve', 'gimnasio'] },
    { id: 'gigante', label: 'La Gigante de Piedra', words: ['gigante', 'ciclismo'] },
    { id: 'meridian', label: 'Meridian', words: ['meridian', 'erp', 'crm'] },
    { id: 'libros', label: 'Libros · No es magia', words: ['libro', 'magia', 'python', 'codigo', 'leer', 'lectura'] },
    { id: 'como-empezar', label: 'Cómo empezar', words: ['pack', 'plan', 'precio', 'presupuesto', 'contratar', 'coste', 'cuesta'] },
    { id: 'demo', label: 'Demos de agentes de ejemplo', words: ['demo', 'automatiza', 'simulacion', 'probar'] },
    { id: 'proceso', label: 'De idea a sistema funcionando', words: ['proceso', 'paso', 'como funciona'] },
    { id: 'servicios', label: 'Servicios LVX', words: ['servicio', 'diseno', 'desarrollo', 'agente', 'ia'] },
    { id: 'contacto', label: 'Contacto', words: ['contacto', 'contactar', 'correo', 'email', 'hablar', 'escribir', 'instagram', 'linkedin'] },
    { id: 'sobre-mi', label: 'Sobre mí y portfolio', words: ['julia', 'sobre mi', 'quien', 'portfolio', 'portafolio'] },
    { id: 'proyectos', label: 'Proyectos', words: ['proyecto', 'trabajo', 'producto'] },
    { id: 'inicio', label: 'Inicio', words: ['inicio', 'arriba', 'home', 'portada'] }
  ];
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const add = (text, user = false) => {
    const item = document.createElement('p');
    item.className = 'robot-bubble' + (user ? ' robot-user' : '');
    item.textContent = text;
    log.append(item);
    while (log.children.length > 18) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
    return item;
  };
  const setOpen = open => {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else launcher.focus();
  };
  const navigate = route => {
    if (route.href) {
      window.location.assign(route.href);
      return;
    }
    const target = document.getElementById(route.id);
    if (!target) return;
    const disclosure = target.closest('details');
    if (disclosure) disclosure.open = true;
    setOpen(false);
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    history.replaceState(null, '', '#' + route.id);
  };
  const offer = route => {
    const item = add('Puedes encontrarlo aquí:');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'robot-destination';
    button.textContent = 'Ir a ' + route.label + ' →';
    button.addEventListener('click', () => navigate(route));
    item.append(button);
    log.scrollTop = log.scrollHeight;
  };
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  panel.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => {
    const route = routes.find(route => route.id === button.dataset.route);
    if (route) navigate(route);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    add(text, true);
    const query = normalize(text);
    if (/\b(blog|articulos?)\b/.test(query)) {
      add('En el blog encontrarás artículos sobre diseño de producto, automatización y código.');
      offer({ label: 'Blog de LVX', href: '/blog' });
      return;
    }
    const route = routes.find(route => route.words.some(word => word.length <= 2 ? query.split(/\W+/).includes(word) : query.includes(word)));
    if (route) offer(route);
    else if (/\b(hola|buenas|hey)\b/.test(query)) add('¡Hola! ¿Te apetece explorar los proyectos, descubrir los libros o conocer los servicios?');
    else add('Soy una guía de navegación. Prueba con «libros», «packs», «demo», «portfolio» o «contacto», o utiliza los accesos rápidos.');
  });
})();

(() => {
  const header = document.querySelector('header');
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('main-navigation');
  if (!header || !toggle || !nav) return;
  const mobile = matchMedia('(max-width: 1000px)');
  const setOpen = open => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.firstChild.textContent = open ? 'Cerrar ' : 'Menú ';
  };
  header.classList.add('has-mobile-menu');
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
      setOpen(false); toggle.focus();
    }
  });
  const updateOffset = () => {
    if (!header.classList.contains('is-menu-open')) {
      document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 16}px`);
    }
  };
  mobile.addEventListener('change', () => { setOpen(false); updateOffset(); });
  if ('ResizeObserver' in window) new ResizeObserver(updateOffset).observe(header);
  updateOffset();
})();
