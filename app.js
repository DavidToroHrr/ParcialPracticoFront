document.addEventListener('DOMContentLoaded', () => {

    const taskInput     = document.getElementById('task-input');
    const addTaskBtn    = document.getElementById('add-task-btn');
    const pendingList   = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const locationText  = document.getElementById('location-text');
    const canvas        = document.getElementById('task-canvas');
    const ctx           = canvas.getContext('2d');

    // Leer tareas guardadas o empezar con array vacío
    let tasks = JSON.parse(localStorage.getItem('tareas')) || [];

    // ── GEOLOCALIZACIÓN ───────────────────────────────────────────────────
    function initLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    // Éxito: mostramos lat y lon con 2 decimales
                    locationText.innerText =
                        "Ubicación: Lat " + pos.coords.latitude.toFixed(2) +
                        ", Lon " + pos.coords.longitude.toFixed(2);
                },
                (error) => {
                    // Error: cada código tiene una causa distinta
                    if (error.code === 1)
                        locationText.innerText = "Ubicación: Permiso denegado por el usuario";
                    if (error.code === 2)
                        locationText.innerText = "Ubicación: Señal o red no disponible";
                    if (error.code === 3)
                        locationText.innerText = "Ubicación: Tiempo de espera agotado";
                }
            );
        } else {
            // El navegador no soporta la API
            locationText.innerText = "Ubicación: Este navegador no soporta geolocalización";
        }
    }

    // ── LOCAL STORAGE ─────────────────────────────────────────────────────
    function saveTasks() {
        // JSON.stringify convierte el array de objetos a string para guardarlo
        localStorage.setItem('tareas', JSON.stringify(tasks));
        renderTasks();
    }

    // ── RENDERIZAR TAREAS ─────────────────────────────────────────────────
    function renderTasks() {
        pendingList.innerHTML   = '';
        completedList.innerHTML = '';

        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className  = 'task-item ' + task.status;
            div.innerText  = task.text;
            div.draggable  = true;       // permite arrastrarlo
            div.dataset.id = task.id;

            // dragstart: guardar el id de la tarea en dataTransfer
            div.addEventListener('dragstart', e => {
                e.dataTransfer.setData('id', task.id);
            });

            if (task.status === 'pending') {
                pendingList.appendChild(div);
            } else {
                completedList.appendChild(div);
            }
        });

        drawCanvas();
    }

    // ── DRAG AND DROP EN COLUMNAS ─────────────────────────────────────────
    const columnas = [
        document.getElementById('pending-column'),
        document.getElementById('completed-column')
    ];

    columnas.forEach(col => {
        // dragover: obligatorio llamar preventDefault o el drop nunca ocurre
        col.addEventListener('dragover', e => {
            e.preventDefault();
        });

        // drop: recuperar el id y cambiar el estado de la tarea
        col.addEventListener('drop', e => {
            e.preventDefault();
            const id   = e.dataTransfer.getData('id');
            const task = tasks.find(t => t.id === id);

            if (task) {
                // col.dataset.status lee el data-status del HTML de la columna
                task.status = col.dataset.status;
                saveTasks();
            }
        });
    });

    // ── CANVAS ────────────────────────────────────────────────────────────
    function drawCanvas() {
        // Limpiar antes de redibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let pending   = tasks.filter(t => t.status === 'pending').length;
        let completed = tasks.filter(t => t.status === 'completed').length;

        // ── Círculo rojo: pendientes ──
        ctx.beginPath();
        ctx.arc(80, 80, 55, 0, 2 * Math.PI);
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.strokeStyle = '#b71c1c';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Número dentro del círculo
        ctx.fillStyle    = 'white';
        ctx.font         = 'bold 28px Arial';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pending, 80, 80);

        // Etiqueta debajo
        ctx.fillStyle    = '#b71c1c';
        ctx.font         = 'bold 13px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('Pendientes', 80, 155);

        // ── Círculo verde: completadas ──
        ctx.beginPath();
        ctx.arc(240, 80, 55, 0, 2 * Math.PI);
        ctx.fillStyle = '#43a047';
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Número dentro del círculo
        ctx.fillStyle    = 'white';
        ctx.font         = 'bold 28px Arial';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(completed, 240, 80);

        // Etiqueta debajo
        ctx.fillStyle    = '#1b5e20';
        ctx.font         = 'bold 13px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('Completadas', 240, 155);
    }

    // ── AGREGAR TAREA ─────────────────────────────────────────────────────
    function agregarTarea() {
        const texto = taskInput.value.trim(); // trim evita tareas con solo espacios
        if (texto) {
            tasks.push({
                id: Date.now().toString(), // id único basado en timestamp
                text: texto,
                status: 'pending'          // siempre empieza en pendientes
            });
            taskInput.value = '';
            saveTasks();
        }
    }

    // Agregar con botón
    addTaskBtn.addEventListener('click', agregarTarea);

    // Agregar también con la tecla Enter
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregarTarea();
    });

    // ── INICIO ────────────────────────────────────────────────────────────
    initLocation();
    renderTasks();
});