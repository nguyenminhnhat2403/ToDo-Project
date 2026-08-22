import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";
const TODO_API = `${API}/api/v1/todos`;

function App() {
  // ============================================================
  // AUTH
  // ============================================================

  const [token, setToken] = useState(
      localStorage.getItem("token")
  );

  const [isRegister, setIsRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ============================================================
  // TODO STATE
  // ============================================================

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const [showNewTask, setShowNewTask] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  // ============================================================
  // MOTIVATION
  // ============================================================

  const [showMotivation, setShowMotivation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // ============================================================
  // HISTORY
  // ============================================================

  const [showHistory, setShowHistory] = useState(false);

  // ============================================================
  // HELPERS
  // ============================================================

  function clearMessages() {
    setError("");
    setMessage("");
  }

  async function readResponse(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  function getErrorMessage(data, fallback) {
    return (
        data?.message ||
        data?.error ||
        fallback
    );
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setTodos([]);
    setSelectedTask(null);
    closeMotivation();
    clearMessages();
  }

  // ============================================================
  // REGISTER
  // ============================================================

  async function handleRegister(e) {
    e.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      const response = await fetch(
          `${API}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: registerForm.name.trim(),
              email: registerForm.email.trim(),
              password: registerForm.password,
            }),
          }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Could not create your account."
            )
        );
      }

      setIsRegister(false);

      setLoginForm({
        email: registerForm.email,
        password: "",
      });

      setRegisterForm({
        name: "",
        email: "",
        password: "",
      });

      setAuthError("");

    } catch (err) {
      console.error("Register error:", err);

      setAuthError(
          err.message === "Failed to fetch"
              ? "Cannot connect to the server. Make sure Spring Boot is running on port 8080."
              : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async function handleLogin(e) {
    e.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      const response = await fetch(
          `${API}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: loginForm.email.trim(),
              password: loginForm.password,
            }),
          }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Invalid email or password."
            )
        );
      }

      if (!data?.token) {
        throw new Error(
            "Login succeeded, but the server did not return a JWT."
        );
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      setLoginForm({
        email: "",
        password: "",
      });

    } catch (err) {
      console.error("Login error:", err);

      setAuthError(
          err.message === "Failed to fetch"
              ? "Cannot connect to the server. Make sure Spring Boot is running on port 8080."
              : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ============================================================
  // LOAD TODOS
  // ============================================================

  async function loadTodos() {
    const currentToken = localStorage.getItem("token");

    console.log("JWT:", currentToken);

    if (!currentToken) {
      setError("No JWT token found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
          "http://localhost:8080/api/v1/todos",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
      );

      console.log("STATUS:", response.status);
      console.log(
          "CONTENT-TYPE:",
          response.headers.get("content-type")
      );

      const text = await response.text();

      console.log("BACKEND RESPONSE:", text);

      if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${text || "empty response"}`
        );
      }

      const data = text ? JSON.parse(text) : [];

      setTodos(data);

    } catch (err) {
      console.error("LOAD TODOS ERROR:", err);

      if (err.message === "Failed to fetch") {
        setError(
            "Browser could not reach Spring Boot. Check CORS and port 8080."
        );
      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadTodos();
    }
  }, [token]);

  // ============================================================
  // CREATE TODO
  // ============================================================

  async function createTodo(e) {
    e.preventDefault();

    if (!newTask.title.trim()) {
      setError("Task title is required.");
      return;
    }

    const currentToken = localStorage.getItem("token");

    try {
      clearMessages();

      const response = await fetch(
          TODO_API,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              title: newTask.title.trim(),
              description: newTask.description.trim(),
            }),
          }
      );

      const data = await readResponse(response);

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error(
            "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                `Failed to create task (${response.status}).`
            )
        );
      }

      setTodos((previous) => [
        ...previous,
        data,
      ]);

      setNewTask({
        title: "",
        description: "",
      });

      setShowNewTask(false);
      setMessage("Task created successfully.");

    } catch (err) {
      console.error("Create todo error:", err);

      if (err.message === "Failed to fetch") {
        setError(
            "Cannot connect to the backend. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setError(err.message);
      }
    }
  }

  // ============================================================
  // UPDATE TODO
  // ============================================================

  async function updateTodo(e) {
    e.preventDefault();

    if (!editingTask?.title?.trim()) {
      setError("Task title is required.");
      return;
    }

    const currentToken = localStorage.getItem("token");

    try {
      clearMessages();

      const response = await fetch(
          `${TODO_API}/${editingTask.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              title: editingTask.title.trim(),
              description:
                  editingTask.description?.trim() || "",
              completed: Boolean(editingTask.completed),
            }),
          }
      );

      const data = await readResponse(response);

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error(
            "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                `Failed to update task (${response.status}).`
            )
        );
      }

      setTodos((previous) =>
          previous.map((todo) =>
              todo.id === data.id
                  ? data
                  : todo
          )
      );

      setEditingTask(null);
      setShowEditTask(false);
      setOpenMenuId(null);
      setMessage("Task updated successfully.");

    } catch (err) {
      console.error("Update todo error:", err);

      setError(err.message);
    }
  }

  // ============================================================
  // COMPLETE TODO
  // ============================================================

  async function toggleTodo(todo) {
    const currentToken = localStorage.getItem("token");

    try {
      clearMessages();

      const response = await fetch(
          `${TODO_API}/${todo.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              title: todo.title,
              description: todo.description || "",
              completed: !todo.completed,
            }),
          }
      );

      const data = await readResponse(response);

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error(
            "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                `Failed to update task (${response.status}).`
            )
        );
      }

      setTodos((previous) =>
          previous.map((item) =>
              item.id === todo.id
                  ? data
                  : item
          )
      );

    } catch (err) {
      console.error("Toggle todo error:", err);
      setError(err.message);
    }
  }

  // ============================================================
  // DELETE TODO
  // ============================================================

  async function deleteTodo(id) {
    if (
        !window.confirm(
            "Are you sure you want to delete this task?"
        )
    ) {
      return;
    }

    const currentToken = localStorage.getItem("token");

    try {
      clearMessages();

      const response = await fetch(
          `${TODO_API}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
      );

      const data = await readResponse(response);

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error(
            "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                `Failed to delete task (${response.status}).`
            )
        );
      }

      setTodos((previous) =>
          previous.filter(
              (todo) => todo.id !== id
          )
      );

    } catch (err) {
      console.error("Delete todo error:", err);
      setError(err.message);
    }
  }

  // ============================================================
  // MOTIVATION AUDIO
  // ============================================================

  function stopMotivationAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsAudioPlaying(false);
  }

  function openMotivation(todo) {
    stopMotivationAudio();

    setSelectedTask(todo);
    setShowMotivation(true);

    const audioFiles = [
      "/audio/motivation-1.mp3",
      "/audio/motivation-2.mp3",
      "/audio/motivation-3.mp3",
    ];

    const randomAudio =
        audioFiles[
            Math.floor(
                Math.random() * audioFiles.length
            )
            ];

    const audio = new Audio(randomAudio);

    audioRef.current = audio;
    audio.volume = 0.8;

    audio.onended = () => {
      setIsAudioPlaying(false);
    };

    audio.onerror = () => {
      audioRef.current = null;
      setIsAudioPlaying(false);

      setError(
          "Audio file not found. Put the motivation mp3 files inside frontend/public/audio/."
      );
    };

    // Start the motivation immediately when Give Up is clicked.
    audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((err) => {
          console.error("Could not autoplay motivation audio:", err);
          setIsAudioPlaying(false);

          setError(
              "The browser blocked autoplay for this audio."
          );
        });
  }

  function closeMotivation() {
    stopMotivationAudio();

    setSelectedTask(null);
    setShowMotivation(false);
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalTasks = todos.length;

  const completedTasks =
      todos.filter(
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

  // ============================================================
  // AUTH SCREEN
  // ============================================================

  if (!token) {
    return (
        <div className="auth-page">
          <div className="auth-glow" />

          <div className="auth-card">

            <div className="auth-logo">
              <div className="auth-logo-icon">
                ✓
              </div>

              <span>FOCUS</span>
            </div>

            <div className="auth-heading">

              <div className="auth-eyebrow">
                YOUR WORKSPACE
              </div>

              <h1>
                {isRegister
                    ? "Create your account."
                    : "Welcome back."}
              </h1>

              <p>
                {isRegister
                    ? "Start building better habits today."
                    : "Sign in to continue your work."}
              </p>

            </div>

            {authError && (
                <div className="auth-error">
                  {authError}
                </div>
            )}

            {isRegister ? (

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >

                  <label>
                    Full name
                  </label>

                  <input
                      type="text"
                      placeholder="Your name"
                      value={registerForm.name}
                      onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            name: e.target.value,
                          })
                      }
                      required
                  />

                  <label>
                    Email
                  </label>

                  <input
                      type="email"
                      placeholder="you@example.com"
                      value={registerForm.email}
                      onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          })
                      }
                      required
                  />

                  <label>
                    Password
                  </label>

                  <input
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                      }
                      required
                  />

                  <button
                      className="auth-submit"
                      type="submit"
                      disabled={authLoading}
                  >
                    {authLoading
                        ? "Creating account..."
                        : "Create account"}
                  </button>

                  <div className="auth-switch">

                <span>
                  Already have an account?
                </span>

                    <button
                        type="button"
                        onClick={() => {
                          setIsRegister(false);
                          setAuthError("");
                        }}
                    >
                      Sign in
                    </button>

                  </div>

                </form>

            ) : (

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >

                  <label>
                    Email
                  </label>

                  <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            email: e.target.value,
                          })
                      }
                      required
                  />

                  <label>
                    Password
                  </label>

                  <input
                      type="password"
                      placeholder="Your password"
                      value={loginForm.password}
                      onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                      }
                      required
                  />

                  <button
                      className="auth-submit"
                      type="submit"
                      disabled={authLoading}
                  >
                    {authLoading
                        ? "Signing in..."
                        : "Sign in"}
                  </button>

                  <div className="auth-switch">

                <span>
                  Don't have an account?
                </span>

                    <button
                        type="button"
                        onClick={() => {
                          setIsRegister(true);
                          setAuthError("");
                        }}
                    >
                      Register
                    </button>

                  </div>

                </form>

            )}

          </div>
        </div>
    );
  }

  // ============================================================
  // MAIN APP
  // ============================================================

  return (
      <div className="app">

        <aside className="sidebar">

          <div className="logo">
            <div className="logo-icon">
              ✓
            </div>

            <span>FOCUS</span>
          </div>

          <nav className="navigation">

            <button
                className="nav-item active"
                type="button"
            >
              <span>▣</span>
              My Tasks
            </button>

            <button
                className="nav-item"
                type="button"
                onClick={() =>
                    setShowHistory(true)
                }
            >
              <span>◷</span>
              History
            </button>

            <button
                className="nav-item"
                type="button"
                onClick={() => {
                  if (todos.length === 0) {
                    setError(
                        "Create a task first."
                    );
                    return;
                  }

                  const target =
                      todos.find(
                          (todo) => !todo.completed
                      ) || todos[0];

                  openMotivation(target);
                }}
            >
              <span>♫</span>
              Motivation
            </button>

          </nav>

          <button
              className="nav-item logout-button"
              type="button"
              onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="sidebar-bottom">

            <div className="user-avatar">
              F
            </div>

            <div>

              <div className="user-name">
                Focus User
              </div>

              <div className="user-role">
                Authenticated user
              </div>

            </div>

          </div>

        </aside>

        <main className="main">

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
                type="button"
                onClick={() =>
                    setShowNewTask(true)
                }
            >
              <span>+</span>
              New Task
            </button>

          </div>

          {error && (
              <div className="error-message">
                {error}
              </div>
          )}

          {message && (
              <div className="success-message">
                {message}
              </div>
          )}

          <section className="stats">

            <div className="stat-card streak-card">
            <span className="stat-label">
              Current streak
            </span>

              <strong>
                🔥 {completedTasks}
              </strong>

              <span className="streak-text">
              completed
            </span>
            </div>

            <div className="stat-card">
            <span className="stat-label">
              Best streak
            </span>

              <strong>
                🏆 {completedTasks}
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

            {loading ? (

                <div className="loading">
                  Loading your tasks...
                </div>

            ) : todos.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    ✓
                  </div>

                  <h3>
                    No tasks yet
                  </h3>

                  <p>
                    Create your first task
                    and start making progress.
                  </p>

                  <button
                      className="create-empty-button"
                      type="button"
                      onClick={() =>
                          setShowNewTask(true)
                      }
                  >
                    Create Task
                  </button>

                </div>

            ) : (

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

                        <button
                            className={`custom-checkbox ${
                                todo.completed
                                    ? "checked"
                                    : ""
                            }`}
                            type="button"
                            onClick={() =>
                                toggleTodo(todo)
                            }
                        >
                          {todo.completed
                              ? "✓"
                              : ""}
                        </button>

                        <div className="todo-content">

                          <h3>
                            {todo.title}
                          </h3>

                          <p>
                            {todo.description ||
                                "No description"}
                          </p>

                        </div>

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

                        <div className="task-menu-wrapper">

                          <button
                              className="delete-button"
                              type="button"
                              onClick={() =>
                                  setOpenMenuId(
                                      openMenuId === todo.id
                                          ? null
                                          : todo.id
                                  )
                              }
                          >
                            ⋮
                          </button>

                          {openMenuId === todo.id && (

                              <div className="task-dropdown">

                                {!todo.completed && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                          toggleTodo(todo);
                                          setOpenMenuId(null);
                                        }}
                                    >
                                      ✓ Complete
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTask({
                                        id: todo.id,
                                        title: todo.title,
                                        description:
                                            todo.description || "",
                                        completed:
                                        todo.completed,
                                      });

                                      setShowEditTask(true);
                                      setOpenMenuId(null);
                                    }}
                                >
                                  ✏ Edit
                                </button>

                                {!todo.completed && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                          openMotivation(todo);
                                          setOpenMenuId(null);
                                        }}
                                    >
                                      🔥 Give Up
                                    </button>
                                )}

                                <button
                                    className="danger"
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      deleteTodo(todo.id);
                                    }}
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

        {/* ========================================================
          NEW TASK MODAL
      ======================================================== */}

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
                    type="button"
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
                  What are you going to accomplish?
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
                            title:
                            e.target.value,
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
                        className="cancel-button"
                        type="button"
                        onClick={() =>
                            setShowNewTask(false)
                        }
                    >
                      Cancel
                    </button>

                    <button
                        className="create-button"
                        type="submit"
                    >
                      Create Task
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

        {/* ========================================================
          EDIT MODAL
      ======================================================== */}

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
                    type="button"
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
                            title:
                            e.target.value,
                          })
                      }
                      autoFocus
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                      value={
                        editingTask.description
                      }
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
                        className="cancel-button"
                        type="button"
                        onClick={() => {
                          setEditingTask(null);
                          setShowEditTask(false);
                        }}
                    >
                      Cancel
                    </button>

                    <button
                        className="create-button"
                        type="submit"
                    >
                      Save Changes
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

        {/* ========================================================
          MOTIVATION MODAL
      ======================================================== */}

        {showMotivation && selectedTask && (

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
                    {isAudioPlaying
                        ? "Playing..."
                        : "Motivation audio"}
                  </span>
                  </div>

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
                    type="button"
                    onClick={closeMotivation}
                >
                  I'll get back to it
                </button>

              </div>

            </div>

        )}

        {/* ========================================================
          HISTORY MODAL
      ======================================================== */}

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
                    type="button"
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
                  Your current tasks and their status.
                </p>

                {todos.length === 0 ? (

                    <div className="history-empty">
                      No tasks yet.
                    </div>

                ) : (

                    <div className="history-list">

                      {todos.map((todo) => (

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

                      ))}

                    </div>

                )}

              </div>

            </div>

        )}

      </div>
  );
}

export default App;