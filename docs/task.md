`logic/task` module provides methods to create, listen new task. Tasks will be persisted in extension storage.
Task module is the key for contentScripts to communicate with Sidepanel (popup) directly (without background as a bridge).

How it works?
method `onNewTask` use vue `watch` to watching the tasks list. method `newTask` will push new task into the tasks list. And since tasks is persisted in storage, when `newTask` change the tasks, watch callback will be triggered even though listener and sender aren't in the same script.
