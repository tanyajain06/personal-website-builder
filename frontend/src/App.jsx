import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("preview");

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("BACKEND RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setResumeData(data.parsedResume);
      setView("preview");
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-card">
          <div className="badge">ResumeSite</div>
          <h1>Resume → Site</h1>

          <label className="file-label">
            <span>{file ? file.name : "Choose a PDF resume"}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button className="primary-btn" onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload Resume"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {resumeData && (
          <div className="sidebar-card toggle-card">
            <button
              className={view === "edit" ? "toggle-btn active" : "toggle-btn"}
              onClick={() => setView("edit")}
            >
              Edit Content
            </button>
            <button
              className={view === "preview" ? "toggle-btn active" : "toggle-btn"}
              onClick={() => setView("preview")}
            >
              Website Preview
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        {!resumeData && (
          <div className="empty-state">
            <h2>Upload a resume to begin</h2>
          </div>
        )}

        {resumeData && view === "edit" && (
          <ResumeEditor data={resumeData} setData={setResumeData} />
        )}

        {resumeData && view === "preview" && (
          <WebsitePreview data={resumeData} />
        )}
      </main>
    </div>
  );
}

function ResumeEditor({ data, setData }) {
  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const updateArrayItem = (field, index, value) => {
    const updated = [...(data[field] || [])];
    updated[index] = value;
    setData({ ...data, [field]: updated });
  };

  const addItem = (field) => {
    setData({ ...data, [field]: [...(data[field] || []), ""] });
  };

  const removeItem = (field, index) => {
    const updated = (data[field] || []).filter((_, i) => i !== index);
    setData({ ...data, [field]: updated });
  };

  return (
    <div className="editor-layout">
      <div className="editor-card pastel-a">
        <h2>Basic Info</h2>

        <label>Name</label>
        <input
          className="text-input"
          value={data.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <label>Email</label>
        <input
          className="text-input"
          value={data.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <label>Phone</label>
        <input
          className="text-input"
          value={data.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <label>LinkedIn</label>
        <input
          className="text-input"
          value={data.linkedin || ""}
          onChange={(e) => updateField("linkedin", e.target.value)}
        />

        <label>GitHub</label>
        <input
          className="text-input"
          value={data.github || ""}
          onChange={(e) => updateField("github", e.target.value)}
        />
      </div>

      <SimpleSection
        title="Education"
        field="education"
        data={data}
        updateArrayItem={updateArrayItem}
        addItem={addItem}
        removeItem={removeItem}
        className="pastel-b"
      />

      <SimpleSection
        title="Skills"
        field="skills"
        data={data}
        updateArrayItem={updateArrayItem}
        addItem={addItem}
        removeItem={removeItem}
        className="pastel-c"
      />
    </div>
  );
}

function SimpleSection({
  title,
  field,
  data,
  updateArrayItem,
  addItem,
  removeItem,
  className,
}) {
  return (
    <div className={`editor-card ${className || ""}`}>
      <div className="section-top">
        <h2>{title}</h2>
        <button className="small-btn" onClick={() => addItem(field)}>
          + Add
        </button>
      </div>

      {(data[field] || []).map((item, index) => (
        <div key={index} className="input-row">
          <input
            className="text-input"
            value={item}
            onChange={(e) => updateArrayItem(field, index, e.target.value)}
          />
          <button className="remove-btn" onClick={() => removeItem(field, index)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function WebsitePreview({ data }) {
  return (
    <div className="site-preview">
      <nav className="site-nav">
        <div className="site-logo">{data.name || "Portfolio"}</div>
        <div className="site-nav-links">
          <a href="#skills">Skills</a>
          <a href="#experience">Work</a>
          <a href="#projects">Projects</a>
        </div>
      </nav>

      <section className="hero-block pastel-a">
        <div>
          <h1>{data.name || "Your Name"}</h1>

          <div className="contact-line">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
          </div>

          <div className="link-row">
            {data.linkedin && (
              <a
                href={formatUrl(data.linkedin)}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {data.github && (
              <a
                href={formatUrl(data.github)}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </section>

      <section id="skills" className="preview-section pastel-b">
        <h2>Skills</h2>
        <div className="skills-wrap">
          {(data.skills || []).map((skill, index) => (
            <span className="skill-pill" key={index}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section id="experience" className="preview-section pastel-c">
        <h2>Work</h2>
        <div className="card-grid">
          {(data.experience || []).length > 0 ? (
            (data.experience || []).map((item, index) => (
              <div className="preview-card" key={index}>
                <h3>{item.heading || "Experience"}</h3>
                <ul>
                  {(item.bullets || []).map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="preview-card">
              <p>No experience parsed yet.</p>
            </div>
          )}
        </div>
      </section>

      <section id="projects" className="preview-section pastel-d">
        <h2>Projects</h2>
        <div className="card-grid">
          {(data.projects || []).length > 0 ? (
            (data.projects || []).map((item, index) => (
              <div className="preview-card" key={index}>
                <h3>{item.heading || "Project"}</h3>
                <ul>
                  {(item.bullets || []).map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="preview-card">
              <p>No projects parsed yet.</p>
            </div>
          )}
        </div>
      </section>

      <section id="education" className="preview-section pastel-e">
        <h2>Education</h2>
        <div className="preview-card">
          {(data.education || []).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatUrl(url) {
  if (!url) return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export default App;