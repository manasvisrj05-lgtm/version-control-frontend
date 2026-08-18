import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./createRepo.css";

const CreateRepo = () => {
  const navigate = useNavigate();

  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRepository = async (e) => {
    e.preventDefault();

    setError("");

    if (!repoName.trim()) {
      setError("Repository name is required.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("User not logged in.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/repo/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: repoName,
            description: description,
            visibility: visibility,
            owner: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create repository."
        );
      }

      console.log("Repository created:", data);

      navigate("/");

    } catch (err) {
      console.error("Error creating repository:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="create-repo-page">
        <div className="create-repo-container">

          <div className="create-repo-header">
            <h1>Create a new repository</h1>

            <p>
              A repository contains all your project files,
              code, and version history.
            </p>
          </div>

          <form onSubmit={handleCreateRepository}>

            <div className="form-group">
              <label>
                Repository name
                <span>*</span>
              </label>

              <input
                type="text"
                value={repoName}
                onChange={(e) =>
                  setRepoName(e.target.value)
                }
                placeholder="my-awesome-project"
              />
            </div>

            <div className="form-group">
              <label>
                Description
                <small> (optional)</small>
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe your repository..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Visibility</label>

              <div className="visibility-options">

                <label className="visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === true}
                    onChange={() => setVisibility(true)}
                  />

                  <div>
                    <strong>Public</strong>
                    <p>
                      Anyone can see this repository.
                    </p>
                  </div>
                </label>

                <label className="visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === false}
                    onChange={() => setVisibility(false)}
                  />

                  <div>
                    <strong>Private</strong>
                    <p>
                      Only you can see this repository.
                    </p>
                  </div>
                </label>

              </div>
            </div>

            {error && (
              <div className="create-repo-error">
                {error}
              </div>
            )}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create repository"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </>
  );
};

export default CreateRepo;