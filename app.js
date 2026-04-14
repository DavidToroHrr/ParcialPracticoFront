document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const locationText = document.getElementById('location-text');
    const canvas = document.getElementById('task-canvas');
    const ctx = canvas.getContext('2d');

    let tasks = JSON.parse(localStorage.getItem('tareas')) || [];

    // Mostrar ubicación
    function initLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                locationText.innerText = "Ubicación: Lat " + pos.coords.latitude.toFixed(2) + ", Lon " + pos.coords.longitude.toFixed(2);
            }, () => {
                locationText.innerText = "Ubicación: No disponible";
            });
        }
    }

    function saveTasks() {
        localStorage.setItem('tareas', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item ' + task.status;
            div.innerText = task.text;
            div.draggable = true;
            div.dataset.id = task.id;

            // Iniciar arrastre
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

    // Configurar drop en las columnas
    const columnas = [
        document.getElementById('pending-column'), 
        document.getElementById('completed-column')
    ];
    
    columnas.forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault(); // Necesario para permitir el drop
        });
        
        col.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('id');
            const task = tasks.find(t => t.id === id);
            
            if (task) {
                // Cambiar el estado según la columna donde se soltó
                task.status = col.dataset.status;
                saveTasks();
            }
        });
    });

    // Dibujar conteo básico en el canvas (círculos)
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let pending = tasks.filter(t => t.status === 'pending').length;
        let completed = tasks.filter(t => t.status === 'completed').length;

        // Círculo para pendientes
        ctx.beginPath();
        ctx.arc(70, 70, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText("Pendientes: " + pending, 20, 130);

        // Círculo para completadas
        ctx.beginPath();
        ctx.arc(220, 70, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText("Completas: " + completed, 175, 130);
    }

    // Evento para agregar nueva tarea
    addTaskBtn.addEventListener('click', () => {
        if (taskInput.value) {
            tasks.push({
                id: Date.now().toString(),
                text: taskInput.value,
                status: 'pending' // Por defecto pendiente
            });
            taskInput.value = '';
            saveTasks();
        }
    });

    initLocation();
    renderTasks();
});
