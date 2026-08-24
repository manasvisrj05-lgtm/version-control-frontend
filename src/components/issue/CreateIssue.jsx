import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./issues.css";

const CreateIssue = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/issue/create/${id}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title,
            description
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create issue."
        );
      }
      console.log("Issue created:", data);
      navigate(`/repo/${id}/issues`);
    } catch (err) {
      console.error(
        "Error creating issue:",
        err
      );
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="create-issue-page">
      <div className="create-issue-container">
        <h1>Create new issue</h1>
        <p>
          Report a bug or suggest an improvement.
        </p>
        {error && (
          <div className="issue-error">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateIssue}>
          <label>
            Title
          </label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <label>
            Description
          </label>
          <textarea
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <div className="create-issue-actions">
            <button
              type="button"
              onClick={() =>
                navigate(`/repo/${id}/issues`)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;