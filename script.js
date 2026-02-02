let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let streak = JSON.parse(localStorage.getItem("streak")) || 0;

function showPage(page) {
  document.getElementById("todayPage").classList.add("hidden");
  document.getElementById("statsPage").classList.add("hidden");

  if (page === "today") renderTasks();
  if (page === "stats") renderCharts();

  document.getElementById(page + "Page").classList.remove("hidden");
}

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  tasks.push({
    text: input.value,
    completed: false,
    date: new Date().toDateString()
  });

  input.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const today = new Date().toDateString();
  const todaysTasks = tasks.filter(t => t.date === today);

  todaysTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = task.completed ? "done" : "";
    li.innerHTML = `
      ${task.text}
      <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleTask(${tasks.indexOf(task)})">
    `;
    list.appendChild(li);
  });

  updateProgress(todaysTasks);
}

function updateProgress(todayTasks) {
  const completed = todayTasks.filter(t => t.completed).length;
  const percent = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText = percent + "% erledigt";

  if (percent === 100 && todayTasks.length > 0) updateStreak();
}

function updateStreak() {
  const lastDate = localStorage.getItem("lastCompleted");
  const today = new Date().toDateString();

  if (lastDate !== today) {
    streak++;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCompleted", today);
  }

  document.getElementById("streak").innerText = `🔥 Streak: ${streak} Tage`;
}

function renderCharts() {
  const days = {};
  tasks.forEach(t => {
    days[t.date] = (days[t.date] || 0) + (t.completed ? 1 : 0);
  });

  const labels = Object.keys(days).slice(-7);
  const values = labels.map(d => days[d]);

  new Chart(document.getElementById("weeklyChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Erledigte Aufgaben",
        data: values
      }]
    }
  });

  const monthlyLabels = Object.keys(days).slice(-30);
  const monthlyValues = monthlyLabels.map(d => days[d]);

  new Chart(document.getElementById("monthlyChart"), {
    type: "line",
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: "Monatlicher Fortschritt",
        data: monthlyValues
      }]
    }
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

renderTasks();

