import React, { useState ,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import {
  BookIcon,
  RepoIcon,
  SearchIcon,
  StarIcon,
} from "@primer/octicons-react";

import "./repo.css";

const Repo = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const filteredRepositories = repositories.filter((repo) =>
    (repo.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    useEffect(() => {
        const fetchStarredRepositories = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
            setError("User not logged in");
            setLoading(false);
            return;
            }
            try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/repo/starred/${userId}`
            );
            console.log("Starred repositories:", response.data);
            setRepositories(response.data.starRepos);
            } catch (err) {
            console.error(
                "Error fetching starred repositories:",
                err
            );
            setError("Unable to fetch starred repositories");
            } finally {
            setLoading(false);
            }
        };
        fetchStarredRepositories();
    }, []);

  return (
    <>
      <Navbar />
      <UnderlineNav
        aria-label="Repository"
        sx={{
          "& .UnderlineNav-item": {
            color: "#ffffff !important",
          },
          "& .UnderlineNav-item:hover": {
            color: "#ffffff !important",
          },
          "& svg": {
            color: "#ffffff !important",
            fill: "#ffffff !important",
          },
        }}
      >
        <UnderlineNav.Item
          onClick={() => navigate("/profile")}
          icon={BookIcon}
        >
          <span style={{ color: "#ffffff" }}>
            Overview
          </span>
        </UnderlineNav.Item>
        <UnderlineNav.Item
          aria-current="page"
          icon={RepoIcon}
        >
          <span style={{ color: "#ffffff" }}>
            Starred Repositories
          </span>
        </UnderlineNav.Item>
      </UnderlineNav>
      <div className="starred-repo-page">
        <div className="starred-repo-header">
          <div>
            <h1>Starred Repositories</h1>
            <p>
              Repositories you have starred
            </p>
          </div>
          <div className="repo-count">
            {repositories.length} repositories
          </div>
        </div>

        <div className="repo-search">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search starred repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

       {loading && (
            <div className="no-repos">
                <h2>Loading starred repositories...</h2>
            </div>
            )}

            {error && !loading && (
            <div className="no-repos">
                <h2>{error}</h2>
            </div>
            )}

            {!loading && !error && (
                <div className="repo-list">
                    {filteredRepositories.length === 0 ? (
                    <div className="no-repos">
                        <StarIcon size={40} />

                        <h2>No starred repositories</h2>

                        <p>
                        You haven't starred any repositories yet.
                        </p>
                    </div>
                    ) : (
                    filteredRepositories.map((repo) => (
                        <div className="repo-card" key={repo._id}>
                        <h3>{repo.name}</h3>

                        <p>{repo.description}</p>

                        <p>
                            ⭐ starred
                        </p>
                        </div>
                    ))
                    )}
                </div>
            )}
      </div>
    </>
  );
};

export default Repo;