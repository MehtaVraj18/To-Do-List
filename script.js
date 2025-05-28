const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Add task when button clicked or Enter pressed
addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const taskText = input.value.trim();
  if (!taskText) return; // ignore empty input

  // Create task item elements
  const li = document.createElement('li');
  li.className = 'task-item';
  li.textContent = taskText;

  // Click on task toggles completion
  li.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  // Create delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = '×';
  delBtn.className = 'delete-btn';
  delBtn.addEventListener('click', e => {
    e.stopPropagation(); // prevent toggling complete
    taskList.removeChild(li);
  });

  li.appendChild(delBtn);
  taskList.appendChild(li);
  input.value = '';
  input.focus();
}
