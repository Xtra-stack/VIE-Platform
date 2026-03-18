import crypto from "crypto";

const DEMO_SESSION_TTL_MS = 60 * 60 * 1000;

class DemoTrialService {
  constructor() {
    this.sessions = new Map();
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (!session || session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  generateId(prefix) {
    return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
  }

  createDefaultTasks() {
    return [
      {
        id: this.generateId("demo_task"),
        title: "Fix onboarding validation bug",
        description: "Update input validation and add one edge case check.",
        status: "ASSIGNED",
        attempts: 0,
        feedback: null,
      },
      {
        id: this.generateId("demo_task"),
        title: "Implement profile card component",
        description: "Build the UI component and wire static mock data.",
        status: "ASSIGNED",
        attempts: 0,
        feedback: null,
      },
      {
        id: this.generateId("demo_task"),
        title: "Add API error banner handling",
        description: "Show user-friendly banner for request failures.",
        status: "ASSIGNED",
        attempts: 0,
        feedback: null,
      },
    ];
  }

  startTrial() {
    this.cleanupExpiredSessions();

    const sessionId = this.generateId("demo_session");
    const token = this.generateId("demo_token");
    const now = Date.now();

    const demoUser = {
      id: this.generateId("demo_user"),
      username: "demo_junior",
      fullName: "Demo Junior",
      role: "JUNIOR",
    };

    const demoWorkspace = {
      id: this.generateId("demo_workspace"),
      name: "Demo Workspace",
      mode: "DEMO",
      status: "ACTIVE",
    };

    const demoProject = {
      id: this.generateId("demo_project"),
      name: "Demo Project",
      slug: "demo-project",
    };

    const sessionState = {
      id: sessionId,
      token,
      user: demoUser,
      workspace: demoWorkspace,
      project: demoProject,
      tasks: this.createDefaultTasks(),
      events: [
        { type: "demo_started", message: "Demo trial started" },
        { type: "workspace_created", message: "Demo workspace created" },
      ],
      createdAt: now,
      expiresAt: now + DEMO_SESSION_TTL_MS,
    };

    this.sessions.set(token, sessionState);

    return {
      token,
      mode: "DEMO",
      user: demoUser,
      workspace: demoWorkspace,
      project: demoProject,
      tasks: sessionState.tasks,
      expiresAt: sessionState.expiresAt,
    };
  }

  getSessionByToken(token) {
    this.cleanupExpiredSessions();
    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }
    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  getState(token) {
    const session = this.getSessionByToken(token);
    if (!session) return null;

    return {
      mode: "DEMO",
      user: session.user,
      workspace: session.workspace,
      project: session.project,
      tasks: session.tasks,
      events: session.events,
      expiresAt: session.expiresAt,
    };
  }

  submitTask(token, taskId) {
    const session = this.getSessionByToken(token);
    if (!session) {
      return null;
    }

    const task = session.tasks.find((item) => item.id === taskId);
    if (!task) {
      const error = new Error("Task not found");
      error.status = 404;
      throw error;
    }

    task.attempts += 1;
    task.status = "SUBMITTED";
    session.events.push({
      type: "submitted",
      message: `Task submitted: ${task.title}`,
      taskId,
      at: new Date().toISOString(),
    });

    if (task.attempts === 1) {
      task.status = "CHANGES_REQUESTED";
      task.feedback = "Senior review: Good start. Refine edge cases and resubmit.";
      session.events.push({
        type: "review_changes_requested",
        message: `Changes requested for: ${task.title}`,
        taskId,
        at: new Date().toISOString(),
      });
    } else {
      task.status = "APPROVED";
      task.feedback = "Manager approval: Task accepted. Great improvement.";
      session.events.push({
        type: "approved",
        message: `Task approved: ${task.title}`,
        taskId,
        at: new Date().toISOString(),
      });
    }

    return {
      task,
      events: session.events,
    };
  }
}

export const demoTrialService = new DemoTrialService();
