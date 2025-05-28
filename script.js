const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const completedList = document.getElementById('completed-list');
const toggleCompletedBtn = document.getElementById('toggle-completed-btn');

let tasks = loadTasks();
let showCompleted = false;

// Render tasks on page load
renderTasks();

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

toggleCompletedBtn.addEventListener('click', () => {
  showCompleted = !showCompleted;
  completedList.classList.toggle('hidden', !showCompleted);
  toggleCompletedBtn.textContent = showCompleted
    ? 'Hide Completed Tasks ▲'
    : 'Show Completed Tasks ▼';
});

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  return saved ? JSON.parse(saved) : [];
}

function renderTasks() {
  taskList.innerHTML = '';
  completedList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = createTaskItem(task.text, task.completed, index);
    if (task.completed) {
      completedList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }
  });
}

function createTaskItem(text, completed, index) {
  const li = document.createElement('li');
  li.className = 'task-item';
  if (completed) li.classList.add('completed');
  li.setAttribute('draggable', !completed);
  li.dataset.index = index;

  // Editable input field
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = text;
  inputField.readOnly = completed; // Completed tasks not editable
  inputField.addEventListener('change', (e) => {
    tasks[index].text = e.target.value.trim() || tasks[index].text;
    saveTasks();
    renderTasks();
  });

  // Toggle completion on click if not editing input
  inputField.addEventListener('click', e => {
    e.stopPropagation();
  });

  li.appendChild(inputField);

  // Toggle completed on item click (only for active tasks)
  if (!completed) {
    li.addEventListener('click', () => {
      tasks[index].completed = true;
      saveTasks();
      renderTasks();
    });
  }

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = '×';
  delBtn.className = 'delete-btn';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  li.appendChild(delBtn);

  // Drag and drop handlers for active tasks only
  if (!completed) {
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);
    li.addEventListener('dragend', dragEnd);
  }

  return li;
}

function addTask() {
  const taskText = input.value.trim();
  if (!taskText) return;
  tasks.push({ text: taskText, completed: false });
  input.value = '';
  saveTasks();
  renderTasks();
  input.focus();
}

// Drag and drop variables
let dragSrcEl = null;

function dragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.index);
  this.classList.add('dragging');
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const draggingOver = this;
  if (draggingOver === dragSrcEl) return;

  const list = draggingOver.parentNode;
  const srcIndex = Number(dragSrcEl.dataset.index);
  const tgtIndex = Number(draggingOver.dataset.index);

  if (srcIndex < tgtIndex) {
    list.insertBefore(dragSrcEl, draggingOver.nextSibling);
  } else {
    list.insertBefore(dragSrcEl, draggingOver);
  }
}

function drop(e) {
  e.stopPropagation();

  const srcIndex = Number(dragSrcEl.dataset.index);
  const tgtIndex = Number(this.dataset.index);

  if (srcIndex === tgtIndex) return;

  // Reorder tasks array
  const movedTask = tasks.splice(srcIndex, 1)[0];
  tasks.splice(tgtIndex, 0, movedTask);

  saveTasks();
  renderTasks();
}

function dragEnd() {
  this.classList.remove('dragging');
}
