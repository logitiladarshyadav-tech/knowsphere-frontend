
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://knowsphere-backend-wcen.onrender.com";

function App() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("Notes");
  const [description, setDescription] = useState("");
  
  const [question, setQuestion] = useState("");
  const [retrievedResources, setRetrievedResources] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);


  async function loadResources() {
    try {
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load resources.");
      }

      const data = await response.json();
      setResources(data);
    } catch {
      setError(
        "Cannot connect to the backend. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  const subjects = [
    "All Subjects",
    ...new Set(
      resources
        .map((resource) => resource.subject?.trim())
        .filter(Boolean)
    ),
  ];

  const filteredResources = resources.filter((resource) => {
    const query = search.toLowerCase().trim();

    const matchesSearch = [
      resource.title,
      resource.subject,
      resource.type,
      resource.description,
    ].some((value) => value?.toLowerCase().includes(query));

    const matchesSubject =
      selectedSubject === "All Subjects" ||
      resource.subject?.trim() === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  async function addResource(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          type,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save the resource.");
      }

      setTitle("");
      setSubject("");
      setType("Notes");
      setDescription("");
      setSelectedSubject("All Subjects");
      setSearch("");

      await loadResources();
      setMessage("Resource added successfully!");
    } catch (err) {
      setError(err.message || "Unable to save the resource.");
    }
  }

  
  

async function retrieveKnowledge(event) {
  event.preventDefault();

  if (!question.trim()) {
    setRetrievedResources([]);
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/documents/search?q=${encodeURIComponent(question.trim())}`
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const documents = await response.json();
    setRetrievedResources(documents);
  } catch (error) {
    console.error(error);
    setError("Could not search uploaded documents. Check that the backend is running.");
  }
}




async function uploadDocument(event) {
  event.preventDefault();

  if (!selectedFile) {
    setUploadMessage("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  setUploading(true);
  setUploadMessage("");

  try {
    const response = await fetch(
      "http://localhost:8080/api/documents/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed.");
    }

    setUploadMessage(
  `Document uploaded and saved successfully! ID: ${data.id}. Extracted characters: ${data.extractedCharacters}`
);
    setSelectedFile(null);
    event.target.reset();
  } catch (error) {
    setUploadMessage(
      error.message || "Could not upload the file."
    );
  } finally {
    setUploading(false);
  }
}



  async function deleteResource(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the resource.");
      }

      await loadResources();
      setMessage("Resource deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete the resource.");
    }
  }

  return (
    <div className="app layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div className="brand-copy">
            <h2>KnowSphere</h2>
            <p>STUDENT KNOWLEDGE HUB</p>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <a className="nav-item active" href="#dashboard">
          <span className="nav-icon">▦</span>
          <span className="nav-text">Dashboard</span>
        </a>

        <a className="nav-item" href="#library">
          <span className="nav-icon">▤</span>
          <span className="nav-text">Knowledge Library</span>
        </a>

        <a className="nav-item" href="#add-resource">
          <span className="nav-icon">＋</span>
          <span className="nav-text">Add Resource</span>
        </a>

        <p className="nav-label">YOUR LEARNING</p>

        <a className="nav-item" href="#library">
          <span className="nav-icon">⌕</span>
          <span className="nav-text">Find Resources</span>
        </a>

        <div className="sidebar-bottom">
          <strong>Student Workspace</strong>
          Organize your learning.
          <br />
          One resource at a time.
        </div>
      </aside>

      <div className="main-area" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace&nbsp; / &nbsp;<strong>Dashboard</strong>
          </div>

          <div className="profile">
            <div className="avatar">ST</div>
            <div>
              <strong>Student</strong>
              <span>Learning workspace</span>
            </div>
          </div>
        </header>

        <main className="content">
          
<section className="panel" id="document-upload">
  <div className="panel-heading">
    <h2>Upload Study Documents</h2>
    <p>Upload PDF, Word, or text files for your knowledge library.</p>
  </div>

  <form className="resource-form" onSubmit={uploadDocument}>
    <label>
      Choose a document
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        required
        onChange={(event) => {
          setSelectedFile(event.target.files[0] || null);
          setUploadMessage("");
        }}
      />
    </label>

    <div className="form-actions">
      <button
        className="primary-button"
        type="submit"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </div>

    {uploadMessage && (
      <p role="status">{uploadMessage}</p>
    )}
  </form>
</section>

          
<section className="panel" id="knowledge-retrieval">
  <div className="panel-heading">
    <h2>AI Knowledge Retrieval</h2>
    <p>
      Ask a study question to find relevant resources from your knowledge library.
    </p>
  </div>

  <form className="resource-form" onSubmit={retrieveKnowledge}>
    <label>
      Enter your question or keywords
      <input
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="e.g. Java inheritance"
        required
      />
    </label>

    <div className="form-actions">
      <button className="primary-button" type="submit">
        Search Knowledge
      </button>
      <button
        className="secondary-button"
        type="button"
        onClick={() => {
          setQuestion("");
          setRetrievedResources([]);
        }}
      >
        Clear
      </button>
    </div>
  </form>

  {question.trim() && retrievedResources.length > 0 && (
    <p className="success-message">
      Found {retrievedResources.length} matching resource(s).
    </p>
  )}

  {retrievedResources.length === 0 && (
    <p className="resource-description">
      Matching study materials will appear here after your search.
    </p>
  )}

  {retrievedResources.length > 0 && (
    <div className="resource-grid">
      {retrievedResources.map((resource) => (
        <article className="resource-card" key={resource.id}>
          
          <span className="resource-type">{resource.fileType}</span>
<h3>{resource.filename}</h3>
<p className="resource-description">
  {resource.excerpt}
</p>
        </article>
      ))}
    </div>
  )}
</section>

          <section className="welcome">
            <div>
              <h1>Your Knowledge Dashboard</h1>
              <p>
                Manage your study materials and find the resources you need.
              </p>
            </div>
            <span className="date-label">✦ &nbsp; Learn. Organize. Grow.</span>
          </section>

          <section className="stats">
            <div className="stat-card">
              <div className="stat-icon blue">▤</div>
              <div>
                <span>Total Resources</span>
                <h2>{resources.length}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">▦</div>
              <div>
                <span>Subjects Covered</span>
                <h2>{subjects.length - 1}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">⌕</div>
              <div>
                <span>Search Results</span>
                <h2>{filteredResources.length}</h2>
              </div>
            </div>
          </section>

          <section className="panel" id="add-resource">
            <div className="panel-heading">
              <h2>Add Learning Resource</h2>
              <p>
                Add notes, assignments, and reference material to your
                knowledge library.
              </p>
            </div>

            <form className="resource-form" onSubmit={addResource}>
              <label>
                Resource title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Java OOP Notes"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Subject
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Java, DBMS, DAA"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Resource type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option>Notes</option>
                  <option>Question Bank</option>
                  <option>Assignment</option>
                  <option>Reference</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Briefly describe the study material..."
                  rows={3}
                  maxLength={255}
                  required
                />
              </label>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  + &nbsp; Save Resource
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setSubject("");
                    setType("Notes");
                    setDescription("");
                    setError("");
                    setMessage("");
                  }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </section>

          <section className="panel" id="library">
            <div className="library-heading">
              <div>
                <h2>Knowledge Library</h2>
                <p>
                  Browse your saved learning materials from the database.
                </p>
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={loadResources}
              >
                ↻ &nbsp; Refresh
              </button>
            </div>

            {error && <p className="error" role="alert">{error}</p>}
            {message && (
              <p className="success-message" role="status">{message}</p>
            )}

            <div className="library-tools">
              <div className="search-wrap">
                <span>⌕</span>
                <input
                  className="search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, subject, type, or description..."
                  aria-label="Search learning resources"
                />
              </div>

              <select
                className="filter-select"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                aria-label="Filter by subject"
              >
                {subjects.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="empty">
                <p>Loading your resources...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📚</div>
                <h3>
                  {resources.length === 0
                    ? "Your library is ready"
                    : "No matching resources found"}
                </h3>
                <p>
                  {resources.length === 0
                    ? "Add your first study resource using the form above."
                    : "Try another search term or select a different subject."}
                </p>
              </div>
            ) : (
              <div className="resource-grid">
                {filteredResources.map((resource) => (
                  <article className="resource-card" key={resource.id}>
                    <div className="resource-card-top">
                      <span className="resource-type">{resource.type}</span>
                      <span className="resource-id">ID #{resource.id}</span>
                    </div>

                    <h3>{resource.title}</h3>
                    <p className="subject">{resource.subject}</p>
                    <p className="resource-description">
                      {resource.description}
                    </p>

                    <div className="card-footer">
                      <span className="saved-label">Saved resource</span>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => deleteResource(resource.id)}
                        aria-label={`Delete ${resource.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer>
          KnowSphere · Student Knowledge Retrieval System
        </footer>
      </div>
    </div>
  );
}

export default App;
