import { useMemo, useState } from "react";
import "./App.css";

const emptyResume = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  leadership: [],
};

function App() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume PDF first.");
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

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResumeData(data.parsedResume || emptyResume);
      setActiveTab("editor");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBasicField = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateListField = (field, index, value) => {
    setResumeData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addListItem = (field) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeListItem = (field, index) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateEntryHeading = (field, index, value) => {
    setResumeData((prev) => {
      const updated = [...prev[field]];
      updated[index] = { ...updated[index], heading: value };
      return { ...prev, [field]: updated };
    });
  };

  const updateEntryBullet = (field, entryIndex, bulletIndex, value) => {
    setResumeData((prev) => {
      const updated = [...prev[field]];
      const updatedBullets = [...updated[entryIndex].bullets];
      updatedBullets[bulletIndex] = value;
      updated[entryIndex] = {
        ...updated[entryIndex],
        bullets: updatedBullets,
      };
      return { ...prev, [field]: updated };
    });
  };

  const addEntry = (field) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: [...prev[field], { heading: "", bullets: [""] }],
    }));
  };

  const removeEntry = (field, index) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addBullet = (field, entryIndex) => {
    setResumeData((prev) => {
      const updated = [...prev[field]];
      updated[entryIndex] = {
        ...updated[entryIndex],
        bullets: [...updated[entryIndex].bullets, ""],
      };
      return { ...prev, [field]: updated };
    });
  };

  const removeBullet = (field, entryIndex, bulletIndex) => {
    setResumeData((prev) => {
      const updated = [...prev[field]];
      updated[entryIndex] = {
        ...updated[entryIndex],
        bullets: updated[entryIndex].bullets.filter((_, i) => i !== bulletIndex),
      };
      return { ...prev, [field]: updated };
    });
  };

  const isReady = useMemo(() => Boolean(resumeData), [resumeData]);

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="brand-card">
          <div className="badge">ResumeSite</div>
          <h1>Resume to Website</h1>
          <p>
            Upload a resume, clean up the extracted content, and preview it as a
            polished personal website.
          </p>

          <label className="upload-box">
            <span>{file ? file.name : "Choose a PDF resume"}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>

          <button className="primary-btn" onClick={handleUpload} disabled={loading}>
            {loading ? "Generating..." : "Upload Resume"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </div>

        {isReady && (
          <div className="tab-card">
            <button
              className={activeTab === "editor" ? "tab active-tab" : "tab"}
              onClick={() => setActiveTab("editor")}
            >
              Edit Content
            </button>
            <button
              className={activeTab === "preview" ? "tab active-tab" : "tab"}
              onClick={() => setActiveTab("preview")}
            >
              Website Preview
            </button>
          </div>
        )}
      </aside>

      <main className="main-panel">
        {!isReady && (
          <div className="empty-state">
            <h2>Start with a resume upload</h2>
            <p>
              Once your PDF is parsed, you can edit the extracted content and view
              your generated website here.
            </p>
          </div>
        )}

        {isReady && activeTab === "editor" && (
          <ResumeEditor
            data={resumeData}
            updateBasicField={updateBasicField}
            updateListField={updateListField}
            addListItem={addListItem}
            removeListItem={removeListItem}
            updateEntryHeading={updateEntryHeading}
            updateEntryBullet={updateEntryBullet}
            addEntry={addEntry}
            removeEntry={removeEntry}
            addBullet={addBullet}
            removeBullet={removeBullet}
          />
        )}

        {isReady && activeTab === "preview" && <WebsitePreview data={resumeData} />}
      </main>
    </div>
  );
}

function ResumeEditor({
  data,
  updateBasicField,
  updateListField,
  addListItem,
  removeListItem,
  updateEntryHeading,
  updateEntryBullet,
  addEntry,
  removeEntry,
  addBullet,
  removeBullet,
}) {
  return (
    <div className="editor-grid">
      <section className="editor-card">
        <h2>Basic Info</h2>
        <TextField
          label="Name"
          value={data.name}
          onChange={(value) => updateBasicField("name", value)}
        />
        <TextField
          label="Email"
          value={data.email}
          onChange={(value) => updateBasicField("email", value)}
        />
        <TextField
          label="Phone"
          value={data.phone}
          onChange={(value) => updateBasicField("phone", value)}
        />
        <TextField
          label="LinkedIn"
          value={data.linkedin}
          onChange={(value) => updateBasicField("linkedin", value)}
        />
        <TextField
          label="GitHub"
          value={data.github}
          onChange={(value) => updateBasicField("github", value)}
        />
      </section>

      <EditableStringList
        title="Education"
        items={data.education}
        onChange={(index, value) => updateListField("education", index, value)}
        onAdd={() => addListItem("education")}
        onRemove={(index) => removeListItem("education", index)}
      />

      <EditableStringList
        title="Skills"
        items={data.skills}
        onChange={(index, value) => updateListField("skills", index, value)}
        onAdd={() => addListItem("skills")}
        onRemove={(index) => removeListItem("skills", index)}
      />

      <EditableEntryList
        title="Experience"
        field="experience"
        items={data.experience}
        updateEntryHeading={updateEntryHeading}
        updateEntryBullet={updateEntryBullet}
        addEntry={addEntry}
        removeEntry={removeEntry}
        addBullet={addBullet}
        removeBullet={removeBullet}
      />

      <EditableEntryList
        title="Projects"
        field="projects"
        items={data.projects}
        updateEntryHeading={updateEntryHeading}
        updateEntryBullet={updateEntryBullet}
        addEntry={addEntry}
        removeEntry={removeEntry}
        addBullet={addBullet}
        removeBullet={removeBullet}
      />

      <EditableEntryList
        title="Leadership & Involvement"
        field="leadership"
        items={data.leadership}
        updateEntryHeading={updateEntryHeading}
        updateEntryBullet={updateEntryBullet}
        addEntry={addEntry}
        removeEntry={removeEntry}
        addBullet={addBullet}
        removeBullet={removeBullet}
      />
    </div>
  );
}

function EditableStringList({ title, items, onChange, onAdd, onRemove }) {
  return (
    <section className="editor-card">
      <div className="section-header">
        <h2>{title}</h2>
        <button className="ghost-btn" onClick={onAdd}>+ Add</button>
      </div>

      {items.map((item, index) => (
        <div className="list-row" key={`${title}-${index}`}>
          <input
            className="text-input"
            value={item}
            onChange={(e) => onChange(index, e.target.value)}
          />
          <button className="remove-btn" onClick={() => onRemove(index)}>
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}

function EditableEntryList({
  title,
  field,
  items,
  updateEntryHeading,
  updateEntryBullet,
  addEntry,
  removeEntry,
  addBullet,
  removeBullet,
}) {
  return (
    <section className="editor-card">
      <div className="section-header">
        <h2>{title}</h2>
        <button className="ghost-btn" onClick={() => addEntry(field)}>
          + Add Entry
        </button>
      </div>

      {items.map((item, entryIndex) => (
        <div className="entry-block" key={`${field}-${entryIndex}`}>
          <div className="section-header">
            <h3>Entry {entryIndex + 1}</h3>
            <button
              className="remove-btn"
              onClick={() => removeEntry(field, entryIndex)}
            >
              Remove Entry
            </button>
          </div>

          <TextField
            label="Heading"
            value={item.heading}
            onChange={(value) => updateEntryHeading(field, entryIndex, value)}
          />

          <div className="bullets-wrap">
            <label className="field-label">Bullets</label>
            {item.bullets.map((bullet, bulletIndex) => (
              <div className="list-row" key={`${field}-${entryIndex}-${bulletIndex}`}>
                <input
                  className="text-input"
                  value={bullet}
                  onChange={(e) =>
                    updateEntryBullet(field, entryIndex, bulletIndex, e.target.value)
                  }
                />
                <button
                  className="remove-btn"
                  onClick={() => removeBullet(field, entryIndex, bulletIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="ghost-btn" onClick={() => addBullet(field, entryIndex)}>
              + Add Bullet
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <input
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function WebsitePreview({ data }) {
  return (
    <div className="site-wrapper">
      <nav className="site-nav">
        <div className="site-logo">{data.name || "Portfolio"}</div>
        <div className="site-links">
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#education">Education</a>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Personal Website Preview</p>
          <h1>{data.name || "Your Name"}</h1>
          <p className="hero-subtext">
            A clean website generated from an uploaded resume, with editable
            sections for experience, projects, education, and skills.
          </p>

          <div className="contact-row">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
          </div>

          <div className="hero-buttons">
            {data.linkedin && (
              <a
                className="outline-link"
                href={formatUrl(data.linkedin)}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {data.github && (
              <a
                className="outline-link"
                href={formatUrl(data.github)}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        </div>

        <div className="hero-card">
          <h3>Quick Summary</h3>
          <p>{data.skills.length} skills extracted</p>
          <p>{data.experience.length} experience entries</p>
          <p>{data.projects.length} projects parsed</p>
        </div>
      </header>

      <section id="skills" className="preview-section">
        <div className="section-title-row">
          <h2>Skills</h2>
        </div>
        <div className="pill-grid">
          {data.skills.map((skill, index) => (
            <span className="pill" key={index}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section id="experience" className="preview-section">
        <h2>Experience</h2>
        <div className="card-grid">
          {data.experience.map((item, index) => (
            <article className="preview-card" key={index}>
              <h3>{item.heading}</h3>
              <ul>
                {item.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="preview-section">
        <h2>Projects</h2>
        <div className="card-grid">
          {data.projects.map((item, index) => (
            <article className="preview-card" key={index}>
              <h3>{item.heading}</h3>
              <ul>
                {item.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="education" className="preview-section">
        <h2>Education</h2>
        <article className="preview-card">
          {data.education.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </article>
      </section>

      <section className="preview-section">
        <h2>Leadership & Involvement</h2>
        <div className="card-grid">
          {data.leadership.map((item, index) => (
            <article className="preview-card" key={index}>
              <h3>{item.heading}</h3>
              <ul>
                {item.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            </article>
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