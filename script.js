const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const completedList = document.getElementById('completed-list');
const toggleCompletedBtn = document.getElementById('toggle-completed-btn');

let tasks = loadTasks();
let showCompleted = false;

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

  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = text;
  inputField.readOnly = completed; // Completed tasks not editable

  // Save edits on blur or Enter key
  inputField.addEventListener('blur', () => {
    if (!completed) {
      updateTaskText(index, inputField.value);
    }
  });
  inputField.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputField.blur();
    }
  });

  li.appendChild(inputField);

  if (!completed) {
    // Mark task completed on click outside input field
    li.addEventListener('click', e => {
      if (e.target !== inputField) {
        tasks[index].completed = true;
        saveTasks();
        renderTasks();
      }
    });
  }

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

  if (!completed) {
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);
    li.addEventListener('dragend', dragEnd);
  }

  return li;
}

function updateTaskText(index, newText) {
  newText = newText.trim();
  if (newText.length === 0) {
    // Delete if empty after edit
    tasks.splice(index, 1);
  } else {
    tasks[index].text = newText;
  }
  saveTasks();
  renderTasks();
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

// Drag and drop handlers
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

  const movedTask = tasks.splice(srcIndex, 1)[0];
  tasks.splice(tgtIndex, 0, movedTask);

  saveTasks();
  renderTasks();
}

function dragEnd() {
  this.classList.remove('dragging');
}
