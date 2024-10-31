
let expect;

before(async () => {
  // Dynamically import Chai to avoid the CommonJS compatibility error
  const chai = await import('chai');
  expect = chai.expect;
});

import { JSDOM } from 'jsdom';

beforeEach(() => {
    const dom = new JSDOM(`
        <input id="taskInput" type="text" />
        <button id="addButton">Add</button>
        <ul id="taskList"></ul>
        <button id="allFilter">All</button>
        <button id="pendingFilter">Pending</button>
        <button id="completedFilter">Completed</button>
    `);
    global.document = dom.window.document;
    global.window = dom.window;

    // Load the necessary functions from your app code
    import('../js/app.js');  // Adjust path as needed
});

describe("To-Do App", function() {

    it("should add a task to the list and clear input", function() {
        const input = document.getElementById('taskInput');
        const addButton = document.getElementById('addButton');

        input.value = 'Sample Task';
        addButton.click();

        const taskList = document.getElementById('taskList');
        expect(taskList.children.length).to.equal(1);
        expect(taskList.children[0].textContent).to.include('Sample Task');
        expect(input.value).to.equal('');  // Input field should be cleared
    });

    it("should not add an empty task", function() {
        const input = document.getElementById('taskInput');
        const addButton = document.getElementById('addButton');

        input.value = '';  // Empty task
        addButton.click();

        const taskList = document.getElementById('taskList');
        expect(taskList.children.length).to.equal(0);  // No task should be added
    });

    it("should delete a task from the list", function() {
        addTask('Delete Me'); 

        const taskList = document.getElementById('taskList');
        const deleteButton = taskList.children[0].querySelector('.deleteButton');

        deleteButton.click();
        expect(taskList.children.length).to.equal(0);  // Task should be deleted
    });

    it("should mark a task as completed and visually distinct", function() {
        addTask('Complete Me');

        const taskList = document.getElementById('taskList');
        const completeButton = taskList.children[0].querySelector('.completeCheckbox');

        completeButton.click();
        expect(taskList.children[0].classList.contains('completed')).to.be.true;
        expect(taskList.children[0].style.textDecoration).to.equal('line-through');  // Check visual change
    });

    it("should edit a task and save changes", function() {
        addTask('Edit Me');

        const taskList = document.getElementById('taskList');
        const taskItem = taskList.children[0];
        const editButton = taskItem.querySelector('.editButton');
        editButton.click();

        const editInput = taskItem.querySelector('.editInput');
        editInput.value = 'Edited Task';
        const saveButton = taskItem.querySelector('.saveButton');
        saveButton.click();

        expect(taskItem.textContent).to.include('Edited Task');
    });

    it("should filter tasks by status", function() {
        addTask('Pending Task');
        addTask('Completed Task');

        const taskList = document.getElementById('taskList');
        const completedCheckbox = taskList.children[1].querySelector('.completeCheckbox');
        completedCheckbox.click();  // Mark as completed

        const allFilter = document.getElementById('allFilter');
        allFilter.click();
        expect(taskList.children.length).to.equal(2);

        const pendingFilter = document.getElementById('pendingFilter');
        pendingFilter.click();
        const pendingTasks = Array.from(taskList.children).filter(task => !task.classList.contains('completed'));
        expect(pendingTasks.length).to.equal(1);

        const completedFilter = document.getElementById('completedFilter');
        completedFilter.click();
        const completedTasks = Array.from(taskList.children).filter(task => task.classList.contains('completed'));
        expect(completedTasks.length).to.equal(1);
    });

    it("should save tasks to local storage", function() {
        addTask('Local Storage Task');

        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        expect(storedTasks).to.be.an('array');
        expect(storedTasks).to.deep.include({ text: 'Local Storage Task', completed: false });
    });

    it("should retrieve tasks from local storage on load", function() {
        // Mock existing tasks in local storage
        const sampleTasks = [
            { text: 'Task from Storage', completed: false },
            { text: 'Completed Task from Storage', completed: true }
        ];
        localStorage.setItem('tasks', JSON.stringify(sampleTasks));

        // Simulate loading tasks from local storage
        loadTasksFromLocalStorage();

        const taskList = document.getElementById('taskList');
        expect(taskList.children.length).to.equal(2);
        expect(taskList.children[0].textContent).to.include('Task from Storage');
        expect(taskList.children[1].classList.contains('completed')).to.be.true;
    });

});
