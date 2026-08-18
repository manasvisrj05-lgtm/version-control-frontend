import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/repo/user/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch repositories: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("User repositories:", data);

        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories:", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/repo/all"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch suggested repositories: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Suggested repositories:", data);

        setSuggestedRepositories(data.repositories || data || []);
      } catch (err) {
        console.error(
          "Error while fetching suggested repositories:",
          err
        );

        setSuggestedRepositories([]);
      }
    };

    const fetchStarredRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/repo/starred/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch starred repositories: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Starred repositories:", data);

        const starredRepositoryIds = (data.starRepos || []).map(
          (repo) => repo._id
        );

        setStarredRepos(starredRepositoryIds);
      } catch (err) {
        console.error(
          "Error while fetching starred repositories:",
          err
        );

        setStarredRepos([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchStarredRepositories();
  }, [userId]);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        (repo.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const handleStar = async (repoId) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/repo/star",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            repoId: repoId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to star repository"
        );
      }

      console.log("Star response:", data);

      if (data.starred) {
        setStarredRepos((prev) => {
          if (
            prev.some(
              (id) => id.toString() === repoId.toString()
            )
          ) {
            return prev;
          }

          return [...prev, repoId];
        });
      } else {
        setStarredRepos((prev) =>
          prev.filter(
            (id) => id.toString() !== repoId.toString()
          )
        );
      }
    } catch (err) {
      console.error("Error starring repository:", err);
    }
  };

  const isStarred = (repoId) => {
    return starredRepos.some(
      (id) => id.toString() === repoId.toString()
    );
  };

  return (
    <>
      <Navbar />

      <section id="dashboard">

        {/* LEFT SIDE */}
        <aside>
          <h3>Suggested Repositories</h3>

          {suggestedRepositories.length === 0 ? (
            <p>No repositories available.</p>
          ) : (
            suggestedRepositories.map((repo) => (
              <div
                className="repo-item"
                key={repo._id}
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <div className="repo-info">
                  <h4>{repo.name}</h4>
                  <p>{repo.description}</p>
                </div>

                <span
                  className={`star-icon ${
                    isStarred(repo._id) ? "starred" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(repo._id);
                  }}
                >
                  {isStarred(repo._id) ? (
                    <i className="fa-solid fa-star"></i>
                  ) : (
                    <i className="fa-regular fa-star"></i>
                  )}
                </span>
              </div>
            ))
          )}
        </aside>

        {/* MIDDLE */}
        <main>
          <h2>Your Repositories</h2>

          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          {searchResults.length === 0 ? (
            <p>No repositories found.</p>
          ) : (
            searchResults.map((repo) => (
              <div
                className="repo-item"
                key={repo._id}
              >
                <div className="repo-info">
                  <h4>{repo.name}</h4>
                  <p>{repo.description}</p>
                </div>

                <span
                  className={`star-icon ${
                    isStarred(repo._id) ? "starred" : ""
                  }`}
                  onClick={() => handleStar(repo._id)}
                >
                  {isStarred(repo._id) ? (
                    <i className="fa-solid fa-star"></i>
                  ) : (
                    <i className="fa-regular fa-star"></i>
                  )}
                </span>
              </div>
            ))
          )}
        </main>

        {/* RIGHT SIDE */}
        <aside>
          <h3>Upcoming Events</h3>

          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>

            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>

            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>

      </section>
    </>
  );
};

export default Dashboard;