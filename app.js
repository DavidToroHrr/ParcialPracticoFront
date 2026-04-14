document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const pendingList = document.getElementById('pending-list');
    const inProgressList = document.getElementById('in-progress-list');
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
        inProgressList.innerHTML = '';

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
            } else if (task.status === 'completed') {
                completedList.appendChild(div);
            } else if (task.status === 'in-progress') {
                inProgressList.appendChild(div);
            }
        });

        drawCanvas();
    }

    // Configurar drop en las columnas
    const columnas = [
        document.getElementById('pending-column'), 
        document.getElementById('completed-column'),
        document.getElementById('in-progress-column')
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
        let inProgress = tasks.filter(t => t.status === 'in-progress').length;

        // Círculo para pendientes
        ctx.beginPath();
        ctx.arc(70, 70, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText("Pendientes: " + pending, 20, 130);


        //circulo para en en progreso
        ctx.beginPath();
        ctx.arc(220, 70, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText("En Progreso: " + inProgress, 175, 130);

        // Círculo para completadas
        ctx.beginPath();
        ctx.arc(370, 70, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText("Completas: " + completed, 325, 130);

        

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
