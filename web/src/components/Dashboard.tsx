import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  priority: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, agentsRes, devicesRes] = await Promise.all([
        axios.get(`${API_BASE}/tasks`),
        axios.get(`${API_BASE}/agents`),
        axios.get(`${API_BASE}/devices`)
      ]);
      setTasks(tasksRes.data.tasks || []);
      setAgents(agentsRes.data.agents || []);
      setDevices(devicesRes.data.devices || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createTask = async () => {
    const title = prompt('Task title:');
    const description = prompt('Task description:');
    if (title && description) {
      try {
        await axios.post(`${API_BASE}/tasks`, {
          title,
          description,
          userId: 'user-123',
          type: 'general',
          priority: 'normal'
        });
        fetchData();
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }
  };

  const createAgent = async () => {
    const name = prompt('Agent name:');
    const type = prompt('Agent type (general/coding/research/media):');
    if (name && type) {
      try {
        await axios.post(`${API_BASE}/agents`, {
          name,
          type,
          ownerId: 'user-123',
          capabilities: ['task-execution', 'logging']
        });
        fetchData();
      } catch (error) {
        console.error('Failed to create agent:', error);
      }
    }
  };

  const createDevice = async () => {
    const name = prompt('Device name:');
    const type = prompt('Device type (computer/phone/wallet/game/library/home/city):');
    if (name && type) {
      try {
        await axios.post(`${API_BASE}/devices`, {
          name,
          type,
          ownerId: 'user-123',
          status: 'offline'
        });
        fetchData();
      } catch (error) {
        console.error('Failed to create device:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading barAngel platform...</div>;

  return (
    <div className="dashboard">
      <header className="header">
        <div className="logo-section">
          <h1>🤖 barAngel AI Platform</h1>
          <p>Multi-Agent AI Operating System</p>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
          <button className={`nav-btn ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>Agents</button>
          <button className={`nav-btn ${activeTab === 'devices' ? 'active' : ''}`} onClick={() => setActiveTab('devices')}>Virtual Devices</button>
          <button className={`nav-btn ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>Film Studio</button>
          <button className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Library</button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'overview' && (
          <section className="tab-content">
            <h2>Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>Tasks</h3><p className="stat-number">{tasks.length}</p><p className="stat-label">Total tasks</p></div>
              <div className="stat-card"><h3>Agents</h3><p className="stat-number">{agents.length}</p><p className="stat-label">Active agents</p></div>
              <div className="stat-card"><h3>Devices</h3><p className="stat-number">{devices.length}</p><p className="stat-label">Virtual devices</p></div>
              <div className="stat-card"><h3>Status</h3><p className="stat-number">🟢</p><p className="stat-label">System online</p></div>
            </div>
            <div className="quick-actions">
              <button className="action-btn" onClick={createTask}>➕ Create Task</button>
              <button className="action-btn" onClick={createAgent}>➕ Register Agent</button>
              <button className="action-btn" onClick={createDevice}>➕ Create Device</button>
            </div>
          </section>
        )}

        {activeTab === 'tasks' && (
          <section className="tab-content">
            <div className="section-header"><h2>Task Queue & Execution</h2><button className="action-btn" onClick={createTask}>➕ New Task</button></div>
            <div className="task-list">
              {tasks.length === 0 ? <p className="empty-state">No tasks yet. Create one to get started.</p> : tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    <span className={`status-badge status-${task.status}`}>{task.status}</span>
                    <span className="priority-badge">{task.priority}</span>
                    <span className="type-badge">{task.type}</span>
                  </div>
                  <small>{new Date(task.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'agents' && (
          <section className="tab-content">
            <div className="section-header"><h2>Agent Network</h2><button className="action-btn" onClick={createAgent}>➕ Register Agent</button></div>
            <div className="agent-grid">
              {agents.length === 0 ? <p className="empty-state">No agents registered yet.</p> : agents.map((agent) => (
                <div key={agent.id} className="agent-card">
                  <h4>{agent.name}</h4>
                  <p className="agent-type">Type: {agent.type}</p>
                  <p className="agent-status">Status: {agent.status}</p>
                  <div className="capabilities"><strong>Capabilities:</strong>{agent.capabilities.map((cap) => <span key={cap} className="capability-tag">{cap}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'devices' && (
          <section className="tab-content">
            <div className="section-header"><h2>Virtual Devices & Workspaces</h2><button className="action-btn" onClick={createDevice}>➕ Create Device</button></div>
            <div className="device-grid">
              {devices.length === 0 ? <p className="empty-state">No virtual devices yet. Create your first device.</p> : devices.map((device) => (
                <div key={device.id} className={`device-card device-${device.type}`}>
                  <h4>{device.name}</h4>
                  <p className="device-type">{device.type}</p>
                  <p className={`device-status status-${device.status}`}>🔴 {device.status}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'studio' && (
          <section className="tab-content">
            <h2>🎬 AI Film Studio & Movie Director</h2>
            <div className="studio-panel">
              <div className="studio-feature"><h3>🎥 Video Generation</h3><p>Generate videos from text prompts using AI models.</p><button className="action-btn">Generate Video</button></div>
              <div className="studio-feature"><h3>🎬 AI Movie Director</h3><p>Create full films with AI-directed scenes, actors, and storytelling.</p><button className="action-btn">Start Film Project</button></div>
              <div className="studio-feature"><h3>🎞️ Scene Editor</h3><p>Edit, arrange, and combine generated scenes into complete movies.</p><button className="action-btn">Open Scene Editor</button></div>
              <div className="studio-feature"><h3>🤖 AI Actors</h3><p>Deploy AI-generated actors with customizable personalities and voices.</p><button className="action-btn">Cast AI Actors</button></div>
            </div>
          </section>
        )}

        {activeTab === 'library' && (
          <section className="tab-content">
            <h2>📚 AI Learning Library & Course Studio</h2>
            <div className="library-panel">
              <div className="library-feature"><h3>📖 Books & Resources</h3><p>Access curated books, research papers, and educational materials.</p><button className="action-btn">Browse Library</button></div>
              <div className="library-feature"><h3>🎓 Course Generation</h3><p>AI generates video courses from web content, books, and expertise.</p><button className="action-btn">Generate Course</button></div>
              <div className="library-feature"><h3>🔍 Web Search & Index</h3><p>Search the internet and index web content for learning materials.</p><button className="action-btn">Search Web</button></div>
              <div className="library-feature"><h3>🎬 Video Course Creator</h3><p>Create video courses with AI narration, slides, and interactive elements.</p><button className="action-btn">Create Video Course</button></div>
              <div className="library-feature"><h3>👨‍🏫 Course Assistant</h3><p>AI tutors and course assistants for learning and instruction.</p><button className="action-btn">Assign Tutor</button></div>
              <div className="library-feature"><h3>📊 Progress Tracking</h3><p>Track learning progress, completion, and skill development.</p><button className="action-btn">View Progress</button></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
