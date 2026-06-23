document.addEventListener("DOMContentLoaded", function () {

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editId = null;

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").setAttribute("min", today);

    const form = document.getElementById("taskForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let title = document.getElementById("title").value.trim();
        let date = document.getElementById("date").value;
        let description = document.getElementById("description").value.trim();
        let priority = document.getElementById("priority").value;

        document.getElementById("titleError").innerText = "";
        document.getElementById("dateError").innerText = "";

        let hasError = false;

        if (!title) {
            document.getElementById("titleError").innerText = "Required";
            hasError = true;
        }

        if (!date) {
            document.getElementById("dateError").innerText = "Required";
            hasError = true;
        }

        if (date && date < today) {
            document.getElementById("dateError").innerText = "Invalid date";
            hasError = true;
        }

        if (hasError) return;

        const taskData = {
            id: editId ? editId : Date.now(),
            title,
            date,
            description,
            priority,
            progress: 0,
            completedAt: null,
            hidden: false
        };

        if (editId === null) {
            tasks.push(taskData);
        } else {
            tasks = tasks.map(t => t.id === editId ? { ...t, ...taskData } : t);
            editId = null;
        }

        saveTasks();
        renderTasks();
        form.reset();
    });

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {

        const container = document.getElementById("taskContainer");
        container.innerHTML = "";

        const searchText = document.getElementById("search").value.toLowerCase();
        const filter = document.getElementById("filterPriority").value;

        tasks.forEach(task => {

            if (task.hidden) return;

            const matchSearch =
                task.title.toLowerCase().includes(searchText) ||
                task.description.toLowerCase().includes(searchText);

            const matchFilter =
                filter === "All" || task.priority === filter;

            if (!matchSearch || !matchFilter) return;

            const isCompleted = task.progress === 100;

            container.innerHTML += `
                <div class="col-md-4" id="task-${task.id}">
                    <div class="card task-card p-3 ${isCompleted ? "bg-success text-white" : ""}">

                        <h5>${task.title}</h5>
                        <p>${task.date}</p>
                        <p>${task.description}</p>
                        <p><b>Priority:</b> ${task.priority}</p>

                        <div class="progress-wrapper">
                            <div class="progress-label">
                                ${isCompleted ? "Task Completed 🎉" : "Progress: " + task.progress + "%"}
                            </div>

                            <input type="range"
                                min="0" max="100"
                                value="${task.progress}"
                                class="progress-slider"
                                onchange="updateProgress(${task.id}, this.value)">
                        </div>

                        <div class="mt-3">
                            <button class="btn btn-warning btn-sm" onclick="editTask(${task.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
                        </div>

                    </div>
                </div>
            `;
        });

        document.getElementById("emptyMessage").style.display = tasks.filter(t => !t.hidden).length ? "none" : "block";
        updateCounters();
    }

    window.updateProgress = function (id, value) {

        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.progress = Number(value);

        if (task.progress === 100) {
            task.status = "completed";
            task.completedAt = task.completedAt || Date.now();
            saveTasks();
            renderTasks();

            setTimeout(() => {
                task.hidden = true;
                saveTasks();
                renderTasks();
            }, 3000);
        }

        saveTasks();
        renderTasks();
    };

    window.editTask = function (id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById("title").value = task.title;
        document.getElementById("date").value = task.date;
        document.getElementById("description").value = task.description;
        document.getElementById("priority").value = task.priority;

        editId = id;
    };

    window.deleteTask = function (id) {
        if (!confirm("Delete this task?")) return;

        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };

    document.getElementById("search").addEventListener("input", renderTasks);
    document.getElementById("filterPriority").addEventListener("change", renderTasks);

    function updateCounters() {
        document.getElementById("assignedCount").innerText = tasks.length;;

        document.getElementById("completedCount").innerText = tasks.filter(t => t.status  === "completed").length;

        document.getElementById("incompleteCount").innerText = tasks.filter(t => t.status !== "completed").length;
    }

    renderTasks();
});