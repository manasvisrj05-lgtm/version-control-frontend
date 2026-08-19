import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./issues.css";

const Issues = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repository, setRepository] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchRepository = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/${id}`
      );
      setRepository(response.data);
    } catch (err) {
      console.error("Error fetching repository:", err);
      setError(
        err.response?.data?.error ||
        "Unable to load repository."
      );
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/issue/all/${id}`
      );
      setIssues(response.data || []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError(
        err.response?.data?.error ||
        "Unable to load issues."
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      await Promise.all([
        fetchRepository(),
        fetchIssues(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Issue description is required.");
      return;
    }
    try {
      setCreating(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/issue/create/${id}`,
        {
          title: title.trim(),
          description: description.trim(),
        }
      );
      console.log("Issue created:", response.data);
      setTitle("");
      setDescription("");
      setShowForm(false);
      await fetchIssues();
    } catch (err) {
      console.error("Error creating issue:", err);
      setError(
        err.response?.data?.error ||
        "Unable to create issue."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="issues-page">
        <div className="issues-loading">
          <div className="loading-spinner"></div>
          <p>Loading issues...</p>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="issues-page">
        <div className="issues-error-page">
          <h2>Repository not found</h2>

          <button
            onClick={() => navigate("/")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

    const handleToggleIssueStatus = async (issueId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "open" ? "closed" : "open";
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/issue/update/${issueId}`,
        {
          status: newStatus,
        }
      );
      await fetchIssues();
    } catch (err) {
      console.error("Error updating issue status:", err);
      setError(
        err.response?.data?.error ||
        "Unable to update issue."
      );
    }
  };
  const isPublic = repository.visibility === true;
  return (
    <div className="issues-page">
      <div className="issues-top">
        <button
          className="back-btn"
          onClick={() => navigate(`/repo/${id}`)}
        >
          ← {repository.name}
        </button>
      </div>

      <div className="issues-header">
        <div className="issues-title-section">
          <div className="issues-title-row">
            <h1>Issues</h1>
            <span
              className={`visibility-badge ${
                isPublic ? "public" : "private"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
          <p>
            Track bugs, feature requests and discussions
            for <strong>{repository.name}</strong>.
          </p>
        </div>
        {isPublic && (
          <button
            className="new-issue-btn"
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
          >
            <span>+</span>
            New issue
          </button>
        )}
      </div>

      {!isPublic && (
        <div className="private-message">
          <div>
            <h3>Private repository</h3>
            <p>
              Issues cannot be created for private
              repositories.
            </p>
          </div>
        </div>
      )}

      {showForm && isPublic && (
        <div className="issue-form-wrapper">
          <form
            className="issue-form"
            onSubmit={handleCreateIssue}
          >
            <div className="form-header">
              <div>
                <h2>Create a new issue</h2>
                <p>
                  Describe the problem or feature you'd
                  like to discuss.
                </p>
              </div>
              <button
                type="button"
                className="close-form-btn"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="issue-error">
                <span>!</span>
                {error}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="issue-title">
                Title
              </label>
              <input
                id="issue-title"
                type="text"
                placeholder="e.g. Login button is not working"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                disabled={creating}
              />
              <small>
                Keep the title short and descriptive.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="issue-description">
                Description
              </label>
              <textarea
                id="issue-description"
                placeholder="Explain the problem, expected behaviour, steps to reproduce, or your feature request..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                disabled={creating}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="create-btn"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create issue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && isPublic && (
        <div className="issue-error standalone">
          <span>!</span>
          {error}
        </div>
      )}
      <div className="issues-container">
        <div className="issues-list-header">
          <div>
            <strong>
              {issues.length}
            </strong>
            {" "}
            {issues.length === 1
              ? "issue"
              : "issues"}
          </div>
          <span>
            {issues.filter(
              (issue) => issue.status === "open"
            ).length} open
          </span>
        </div>
        {issues.length === 0 ? (
          <div className="no-issues">
            <div className="empty-icon">
              ○
            </div>

            <h2>
              No issues yet
            </h2>

            <p>
              This repository doesn't have any issues.
            </p>

            {isPublic && (
              <button
                className="empty-create-btn"
                onClick={() => {
                  setShowForm(true);
                  setError("");
                }}
              >
                Create the first issue
              </button>
            )}
          </div>

        ) : (
          <div className="issue-list">
            {issues.map((issue) => (
              <div
                className="issue-item"
                key={issue._id}
              >
                <div
                  className={`issue-status-icon ${
                    issue.status
                  }`}
                >
                  {issue.status === "open"
                    ? "●"
                    : "✓"}
                </div>
                <div className="issue-content">
                  <h3>
                    {issue.title}
                  </h3>

                  <p>
                    {issue.description}
                  </p>
                  <div className="issue-meta">
                    <span>
                      #{issue._id.slice(-6)}
                    </span>
                    <span>·</span>
                    <span>
                      {issue.status}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(
                        issue.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                      <div className="issue-actions">
                  <button
                    className={
                      issue.status === "open"
                        ? "close-issue-btn"
                        : "reopen-issue-btn"
                    }
                    onClick={() =>
                      handleToggleIssueStatus(
                        issue._id,
                        issue.status
                      )
                    }
                  >
                    {issue.status === "open"
                      ? "Close issue"
                      : "Reopen issue"}
                  </button>
                </div>
              </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Issues;