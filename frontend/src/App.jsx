import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/v1";
const USER_ID = 1;

function App() {
  // =========================
  // STATE
  // =========================

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    completedToday: false,
  });

  // New task
  const [showNewTask, setShowNewTask] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  // Give up
  const [showGiveUp, setShowGiveUp] = useState(false);
  const [motivationAudio, setMotivationAudio] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [historyDate, setHistoryDate] = useState("");
  const [historyTodos, setHistoryTodos] = useState([]);

  // Task menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Edit
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // =========================
  // GET STREAK
  // =========================

  const fetchStreak = async () => {
    try {
      const response = await fetch(
          `${API_URL}/users/${USER_ID}/streak`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch streak");
      }

      const data = await response.json();

      setStreak(data);
    } catch (error) {
      console.error("Streak error:", error);
    }
  };

  // =========================
  // GET HISTORY
  // =========================

  const fetchHistory = async (date) => {
    try {
      const response = await fetch(
          `${API_URL}/todos/user/${USER_ID}/history?date=${date}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();

      setHistoryTodos(data);
    } catch (error) {
      console.error("History error:", error);
      setHistoryTodos([]);
    }
  };

  const openHistory = () => {
    const today = new Date()
        .toISOString()
        .split("T")[0];

    setHistoryDate(today);
    fetchHistory(today);
    setShowHistory(true);
  };

  // =========================
  // GET TODOS
  // =========================

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
          `${API_URL}/todos/user/${USER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }

      const data = await response.json();

      setTodos(data);
    } catch (error) {
      console.error(error);
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchTodos();
    fetchStreak();
  }, []);

  // =========================
  // CREATE TODO
  // =========================

  const createTodo = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
          `${API_URL}/todos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newTask.title,
              description: newTask.description,
              userId: USER_ID,
            }),
          }
      );

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const createdTodo = await response.json();

      setTodos((prev) => [
        ...prev,
        createdTodo,
      ]);

      setNewTask({
        title: "",
        description: "",
      });

      setShowNewTask(false);
    } catch (error) {
      console.error(error);
      setError("Could not create task.");
    }
  };

  // =========================
  // COMPLETE TODO
  // =========================

  const completeTodo = async (todo) => {
    try {
      setError("");

      const response = await fetch(
          `${API_URL}/todos/${todo.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: todo.title,
              description: todo.description,
              completed: !todo.completed,
            }),
          }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();

      setTodos((prev) =>
          prev.map((item) =>
              item.id === updatedTodo.id
                  ? updatedTodo
                  : item
          )
      );

      setOpenMenuId(null);

      await fetchStreak();
    } catch (error) {
      console.error(error);
      setError("Could not update task.");
    }
  };

  // =========================
  // DELETE TODO
  // =========================

  const deleteTodo = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
          `${API_URL}/todos/${id}`,
          {
            method: "DELETE",
          }
      );

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prev) =>
          prev.filter(
              (todo) => todo.id !== id
          )
      );

      setOpenMenuId(null);

      await fetchStreak();
    } catch (error) {
      console.error(error);
      setError("Could not delete task.");
    }
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleEdit = (todo) => {
    setEditingTask({
      id: todo.id,
      title: todo.title,
      description: todo.description || "",
      completed: todo.completed,
    });

    setOpenMenuId(null);
    setShowEditTask(true);
  };

  // =========================
  // UPDATE TODO
  // =========================

  const updateTodo = async (e) => {
    e.preventDefault();

    if (!editingTask.title.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
          `${API_URL}/todos/${editingTask.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: editingTask.title,
              description: editingTask.description,
              completed: editingTask.completed,
            }),
          }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();

      setTodos((prev) =>
          prev.map((todo) =>
              todo.id === updatedTodo.id
                  ? updatedTodo
                  : todo
          )
      );

      setEditingTask(null);
      setShowEditTask(false);
    } catch (error) {
      console.error(error);
      setError("Could not edit task.");
    }
  };

  // =========================
  // GIVE UP
  // =========================

  const giveUp = (todo) => {
    setSelectedTask(todo);
    setOpenMenuId(null);
    setShowGiveUp(true);

    const audioFiles = [
      "/audio/motivation-1.mp3",
      "/audio/motivation-2.mp3",
      "/audio/motivation-3.mp3",
    ];

    const randomAudio =
        audioFiles[
            Math.floor(Math.random() * audioFiles.length)
            ];

    const audio = new Audio(randomAudio);

    audio.volume = 0.8;

    setMotivationAudio(audio);

    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  };
  const getBackToWork = () => {
    if (motivationAudio) {
      motivationAudio.pause();
      motivationAudio.currentTime = 0;
    }

    setMotivationAudio(null);
    setShowGiveUp(false);
    setSelectedTask(null);
  };

  // =========================
  // STATS
  // =========================

  const totalTasks = todos.length;

  const completedTasks = todos.filter(
      (todo) => todo.completed
  ).length;

  const remainingTasks =
      totalTasks - completedTasks;

  const progress =
      totalTasks === 0
          ? 0
          : Math.round(
              (completedTasks / totalTasks) * 100
          );

  // =========================
  // RENDER
  // =========================

  return (
      <div className="app">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <div className="logo">
            <div className="logo-icon">
              ✓
            </div>

            <span>FOCUS</span>
          </div>

          <nav className="navigation">

            <button className="nav-item active">
              <span>▣</span>
              My Tasks
            </button>

            <button
                className="nav-item"
                onClick={openHistory}
            >
              <span>◷</span>
              History
            </button>

            <button className="nav-item">
              <span>♬</span>
              Motivation
            </button>

          </nav>

          <div className="sidebar-bottom">

            <div className="user-avatar">
              N
            </div>

            <div>
              <div className="user-name">
                Nguyen Minh Nhat
              </div>

              <div className="user-role">
                Developer
              </div>
            </div>

          </div>

        </aside>

        {/* ================= MAIN ================= */}

        <main className="main">

          {/* TOP BAR */}

          <div className="top-bar">

            <div>

              <div className="eyebrow">
                YOUR WORKSPACE
              </div>

              <h1>
                My Tasks
              </h1>

              <p>
                Stay focused. Get things done.
              </p>

            </div>

            <button
                className="new-task-button"
                onClick={() =>
                    setShowNewTask(true)
                }
            >
              <span>+</span>
              New Task
            </button>

          </div>

          {/* ERROR */}

          {error && (
              <div className="error-message">
                {error}
              </div>
          )}

          {/* ================= STATS ================= */}

          <section className="stats">

            <div className="stat-card streak-card">

            <span className="stat-label">
              Current streak
            </span>

              <strong>
                🔥 {streak.currentStreak}
              </strong>

              <span className="streak-text">
              {streak.currentStreak === 1
                  ? "day"
                  : "days"}
            </span>

            </div>

            <div className="stat-card">

            <span className="stat-label">
              Best streak
            </span>

              <strong>
                🏆 {streak.longestStreak}
              </strong>

              <span className="streak-text">
              personal best
            </span>

            </div>

            <div className="stat-card">

            <span className="stat-label">
              Total tasks
            </span>

              <strong>
                {totalTasks}
              </strong>

            </div>

            <div className="stat-card">

            <span className="stat-label">
              Completed
            </span>

              <strong>
                {completedTasks}
              </strong>

            </div>

            <div className="stat-card">

            <span className="stat-label">
              Remaining
            </span>

              <strong>
                {remainingTasks}
              </strong>

            </div>

            <div className="stat-card progress-card">

            <span className="stat-label">
              Progress
            </span>

              <strong>
                {progress}%
              </strong>

              <div className="progress-bar">

                <div
                    className="progress-value"
                    style={{
                      width: `${progress}%`,
                    }}
                />

              </div>

            </div>

          </section>

          {/* ================= TASK SECTION ================= */}

          <section className="tasks-section">

            <div className="section-header">

              <div>

                <h2>
                  Today's Tasks
                </h2>

                <span>
                {totalTasks}{" "}
                  {totalTasks === 1
                      ? "task"
                      : "tasks"}
              </span>

              </div>

            </div>

            {/* LOADING */}

            {loading && (
                <div className="loading">
                  Loading your tasks...
                </div>
            )}

            {/* EMPTY */}

            {!loading &&
                todos.length === 0 && (

                    <div className="empty-state">

                      <div className="empty-icon">
                        ✓
                      </div>

                      <h3>
                        No tasks yet
                      </h3>

                      <p>
                        Create your first task
                        and get started.
                      </p>

                      <button
                          className="create-empty-button"
                          onClick={() =>
                              setShowNewTask(true)
                          }
                      >
                        Create Task
                      </button>

                    </div>

                )}

            {/* TODO LIST */}

            {!loading &&
                todos.length > 0 && (

                    <div className="todo-list">

                      {todos.map((todo) => (

                          <div
                              className={`todo-card ${
                                  todo.completed
                                      ? "completed"
                                      : ""
                              }`}
                              key={todo.id}
                          >

                            {/* CHECKBOX */}

                            <button
                                className={`custom-checkbox ${
                                    todo.completed
                                        ? "checked"
                                        : ""
                                }`}
                                onClick={() =>
                                    completeTodo(todo)
                                }
                                aria-label="Complete task"
                            >
                              {todo.completed && "✓"}
                            </button>

                            {/* CONTENT */}

                            <div className="todo-content">

                              <h3>
                                {todo.title}
                              </h3>

                              <p>
                                {todo.description ||
                                    "No description"}
                              </p>

                            </div>

                            {/* STATUS */}

                            <div className="todo-status">

                              {todo.completed ? (

                                  <span className="status completed-status">
                          Completed
                        </span>

                              ) : (

                                  <span className="status progress-status">
                          In progress
                        </span>

                              )}

                            </div>

                            {/* ACTION MENU */}

                            <div className="task-menu-wrapper">

                              <button
                                  className="delete-button"
                                  onClick={() =>
                                      setOpenMenuId(
                                          openMenuId === todo.id
                                              ? null
                                              : todo.id
                                      )
                                  }
                                  title="Task options"
                              >
                                ⋮
                              </button>

                              {openMenuId === todo.id && (

                                  <div className="task-dropdown">

                                    {!todo.completed && (

                                        <button
                                            onClick={() =>
                                                completeTodo(todo)
                                            }
                                        >
                                          ✓ Complete
                                        </button>

                                    )}

                                    <button
                                        onClick={() =>
                                            handleEdit(todo)
                                        }
                                    >
                                      ✏ Edit
                                    </button>

                                    {!todo.completed && (

                                        <button
                                            onClick={() =>
                                                giveUp(todo)
                                            }
                                        >
                                          × Give Up
                                        </button>

                                    )}

                                    <button
                                        className="danger"
                                        onClick={() =>
                                            deleteTodo(todo.id)
                                        }
                                    >
                                      🗑 Delete
                                    </button>

                                  </div>

                              )}

                            </div>

                          </div>

                      ))}

                    </div>

                )}

          </section>

        </main>

        {/* ================================================= */}
        {/* NEW TASK MODAL */}
        {/* ================================================= */}

        {showNewTask && (

            <div
                className="modal-overlay"
                onClick={() =>
                    setShowNewTask(false)
                }
            >

              <div
                  className="modal"
                  onClick={(e) =>
                      e.stopPropagation()
                  }
              >

                <button
                    className="modal-close"
                    onClick={() =>
                        setShowNewTask(false)
                    }
                >
                  ×
                </button>

                <div className="modal-eyebrow">
                  NEW TASK
                </div>

                <h2>
                  Create a task
                </h2>

                <p className="modal-description">
                  What are you going to
                  accomplish?
                </p>

                <form onSubmit={createTodo}>

                  <label>
                    Title
                  </label>

                  <input
                      type="text"
                      placeholder="e.g. Learn Spring Security"
                      value={newTask.title}
                      onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            title: e.target.value,
                          })
                      }
                      autoFocus
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                      placeholder="What exactly do you need to do?"
                      value={newTask.description}
                      onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            description:
                            e.target.value,
                          })
                      }
                  />

                  <div className="modal-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                            setShowNewTask(false)
                        }
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        className="create-button"
                    >
                      Create Task
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

        {/* ================================================= */}
        {/* EDIT TASK MODAL */}
        {/* ================================================= */}

        {showEditTask && editingTask && (

            <div
                className="modal-overlay"
                onClick={() =>
                    setShowEditTask(false)
                }
            >

              <div
                  className="modal"
                  onClick={(e) =>
                      e.stopPropagation()
                  }
              >

                <button
                    className="modal-close"
                    onClick={() =>
                        setShowEditTask(false)
                    }
                >
                  ×
                </button>

                <div className="modal-eyebrow">
                  EDIT TASK
                </div>

                <h2>
                  Edit your task
                </h2>

                <p className="modal-description">
                  Update the task details.
                </p>

                <form onSubmit={updateTodo}>

                  <label>
                    Title
                  </label>

                  <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            title: e.target.value,
                          })
                      }
                      autoFocus
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                      value={editingTask.description}
                      onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            description:
                            e.target.value,
                          })
                      }
                  />

                  <div className="modal-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => {
                          setEditingTask(null);
                          setShowEditTask(false);
                        }}
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        className="create-button"
                    >
                      Save Changes
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

        {/* ================================================= */}
        {/* GIVE UP MODAL */}
        {/* ================================================= */}

        {showGiveUp && selectedTask && (

            <div className="modal-overlay">
              <div
                  className="motivation-modal"
                  onClick={(e) =>
                      e.stopPropagation()
                  }
              >

                <div className="motivation-icon">
                  🔥
                </div>

                <div className="modal-eyebrow">
                  YOU GAVE UP
                </div>

                <h2>
                  Get back to work.
                </h2>

                <p>
                  You don't need motivation.
                  You need discipline.
                </p>

                <div className="motivation-card">

                  <div className="audio-icon">
                    ♬
                  </div>

                  <div>

                    <strong>
                      Motivation
                    </strong>

                    <span>
                  Audio coming soon...
                </span>

                  </div>

                  <button
                      className="play-button"
                      disabled
                  >
                    ▶
                  </button>

                </div>

                <div className="give-up-task">

              <span>
                You gave up on
              </span>

                  <strong>
                    {selectedTask.title}
                  </strong>

                </div>

                <button
                    className="back-to-work-button"
                    onClick={getBackToWork}
                >
                  I'll get back to it
                </button>

              </div>

            </div>

        )}

        {/* ================================================= */}
        {/* HISTORY MODAL */}
        {/* ================================================= */}

        {showHistory && (

            <div
                className="modal-overlay"
                onClick={() =>
                    setShowHistory(false)
                }
            >

              <div
                  className="history-modal"
                  onClick={(e) =>
                      e.stopPropagation()
                  }
              >

                <button
                    className="modal-close"
                    onClick={() =>
                        setShowHistory(false)
                    }
                >
                  ×
                </button>

                <div className="modal-eyebrow">
                  TASK HISTORY
                </div>

                <h2>
                  Your history
                </h2>

                <p className="modal-description">
                  See what you worked on each day.
                </p>

                <div className="history-date">

                  <label>
                    Select date
                  </label>

                  <input
                      type="date"
                      value={historyDate}
                      onChange={(e) => {

                        const date =
                            e.target.value;

                        setHistoryDate(date);

                        fetchHistory(date);

                      }}
                  />

                </div>

                <div className="history-list">

                  {historyTodos.length === 0 ? (

                      <div className="history-empty">
                        No tasks created on this day.
                      </div>

                  ) : (

                      historyTodos.map((todo) => (

                          <div
                              className="history-item"
                              key={todo.id}
                          >

                            <div
                                className={`history-check ${
                                    todo.completed
                                        ? "history-check-done"
                                        : ""
                                }`}
                            >
                              {todo.completed
                                  ? "✓"
                                  : ""}
                            </div>

                            <div className="history-content">

                              <strong>
                                {todo.title}
                              </strong>

                              <span>
                        {todo.description ||
                            "No description"}
                      </span>

                            </div>

                            <div>

                              {todo.completed ? (

                                  <span className="history-completed">
                          Completed
                        </span>

                              ) : (

                                  <span className="history-pending">
                          Incomplete
                        </span>

                              )}

                            </div>

                          </div>

                      ))

                  )}

                </div>

              </div>

            </div>

        )}

      </div>
  );
}

export default App;