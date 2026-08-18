import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: "Username",
  });

  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setCurrentUser } = useAuth();

  const userId = localStorage.getItem("userId");

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/userProfile/${userId}`
        );

        console.log("User details:", response.data);

        setUserDetails(response.data);
      } catch (err) {
        console.error("Cannot fetch user details:", err);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Fetch user's repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/repo/user/${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const data = await response.json();

        console.log("Profile repositories:", data);

        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setRepositories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [userId]);

  return (
    <>
      <Navbar />

      {/* Navigation */}
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
        >
          <span style={{ color: "#ffffff" }}>
            Overview
          </span>
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/repo/star")}
          icon={RepoIcon}
        >
          <span style={{ color: "#ffffff" }}>
            Starred Repositories
          </span>
        </UnderlineNav.Item>
      </UnderlineNav>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");

          setCurrentUser(null);

          window.location.href = "/auth";
        }}
        style={{
            position:"relative",
            marginLeft:"90rem",
            bottom:"37px"
        }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">

        {/* User Profile */}
        <div className="user-profile-section">

          <div className="profile-image">
          </div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn">
            Follow
          </button>

          <div className="follower">
            <p>10 Follower</p>
            <p>3 Following</p>
          </div>

        </div>

        {/* Heat Map */}
        <div className="heat-map-section">
          <HeatMapProfile />
        </div>
      </div>
      
      {/* Repositories */}
      <section className="profile-repositories">
        <div className="profile-repositories-header">
          <h2>Repositories</h2>
        </div>
        {loading ? (
            <p>Loading repositories...</p>
          ) : repositories.length === 0 ? (
            <p>You don't have any repositories yet.</p>
          ) : (
            <div className="profile-repo-list">

              {repositories.map((repo) => (
                <div
                  className="profile-repo-card"
                  key={repo._id}
                  onClick={() =>
                    navigate(`/repo/${repo._id}`)
                  }
                >

                <div className="profile-repo-content">

                  <h3>{repo.name}</h3>

                  <p>
                    {repo.description ||
                    "No description provided."}
                  </p>

                    <span>
                      {repo.visibility
                        ? "Public"
                        : "Private"}
                    </span>

                </div>

              </div>
            ))}

            </div>
          )}

        </section>
    </>
  );
};

export default Profile;