// ====== STORAGE ======
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let streak = JSON.parse(localStorage.getItem("streak")) || 0;

// ====== DATE HELPER ======
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// ====== SAVE ======
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ====== PAGE NAV ======
function showPage(page) {
  document.getElementById("todayPage").classList.add("hidden");
  document.getElementById("statsPage").classList.add("hidden");

  document.getElementById(page + "Page").classList.remove("hidden");

  if (page === "today") renderTasks();
  if (page === "stats") renderCharts();
}

// ====== ADD TASK ======
function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  tasks.push({
    text: input.value,
    completedDates: [] // daily completion tracking
  });

  input.value = "";
  saveTasks();
  renderTasks();
}

// ====== TOGGLE TASK ======
function toggleTask(index) {
  const today = getToday();
  const task = tasks[index];

  if (task.completedDates.includes(today)) {
    task.completedDates = task.completedDates.filter(d => d !== today);
  } else {
    task.completedDates.push(today);
  }

  saveTasks();
  renderTasks();
}

// ====== RENDER TASKS ======
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const today = getToday();

  tasks.forEach((task, index) => {
    const doneToday = task.completedDates.includes(today);

    const li = document.createElement("li");
    li.className = doneToday ? "done" : "";
    li.innerHTML = `
      <span>${task.text}</span>
      <input type="checkbox" ${doneToday ? "checked" : ""} onclick="toggleTask(${index})">
    `;
    list.appendChild(li);
  });

  updateProgress();
}

// ====== PROGRESS ======
function updateProgress() {
  const today = getToday();

  const completed = tasks.filter(task =>
    task.completedDates.includes(today)
  ).length;

  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText = percent + "% erledigt";

  if (percent === 100 && tasks.length > 0) updateStreak();
}

// ====== STREAK ======
function updateStreak() {
  const today = getToday();
  const lastDate = localStorage.getItem("lastCompleted");

  if (lastDate !== today) {
    streak++;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCompleted", today);
  }

  document.getElementById("streak").innerText = `🔥 Streak: ${streak} Tage`;
}

// ====== CHARTS ======
function renderCharts() {
  const dayStats = {};

  tasks.forEach(task => {
    task.completedDates.forEach(date => {
      dayStats[date] = (dayStats[date] || 0) + 1;
    });
  });

  const allDates = Object.keys(dayStats).sort();

  const weeklyLabels = allDates.slice(-7);
  const weeklyValues = weeklyLabels.map(d => dayStats[d]);

  const monthlyLabels = allDates.slice(-30);
  const monthlyValues = monthlyLabels.map(d => dayStats[d]);

  // Weekly Chart
  new Chart(document.getElementById("weeklyChart"), {
    type: "bar",
    data: {
      labels: weeklyLabels,
      datasets: [{
        label: "Erledigte Aufgaben",
        data: weeklyValues
      }]
    },
    options: {
      responsive: true
    }
  });

  // Monthly Chart
  new Chart(document.getElementById("monthlyChart"), {
    type: "line",
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: "Monatlicher Fortschritt",
        data: monthlyValues
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ====== DARK MODE ======
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// Load Dark Mode on start
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// ====== INIT ======
renderTasks();
document.getElementById("streak").innerText = `🔥 Streak: ${streak} Tage`;
