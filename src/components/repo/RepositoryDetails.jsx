import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./repositoryDetails.css";

const RepositoryDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [repository, setRepository] = useState(null);
    const [commits, setCommits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchRepository = async () => {

            try {

                // Fetch repository information
                const repositoryResponse = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/repo/${id}`
                );

                if (!repositoryResponse.ok) {
                    throw new Error("Repository not found");
                }

                const repositoryData = await repositoryResponse.json();

                console.log("Repository:", repositoryData);

                setRepository(repositoryData);


                // Fetch commits belonging to this repository
                const commitsResponse = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/commit/repository/${id}`
                );

                if (!commitsResponse.ok) {
                    throw new Error("Unable to fetch commits");
                }

                const commitsData = await commitsResponse.json();

                console.log("Commits:", commitsData);

                setCommits(commitsData.commits || []);

            } catch (err) {

                console.error(err);
                setError(err.message);

            } finally {

                setLoading(false);

            }
        };

        fetchRepository();

    }, [id]);


    if (loading) {
        return <h2>Loading repository...</h2>;
    }


    if (error) {
        return <h2>{error}</h2>;
    }


    if (!repository) {
        return <h2>Repository not found</h2>;
    }


    return (

        <div className="repository-page">

            {/* Repository Header */}

            <div className="repository-header">

                <div>

                    <h1>{repository.name}</h1>

                    <p>
                        {repository.description ||
                            "No description provided."}
                    </p>

                    <span>
                        {repository.visibility
                            ? "Public"
                            : "Private"}
                    </span>

                </div>


                <button
                    onClick={() =>
                        navigate(`/repo/${id}/issues`)
                    }
                >
                    Issues
                </button>

            </div>


            {/* Commit History */}

            <div className="commit-section">

                <h2>Commits</h2>


                {commits.length === 0 ? (

                    <p>No commits yet.</p>

                ) : (

                    <div className="commit-list">

                        {commits.map((commit) => (

                            <div
                                className="commit-card"
                                key={commit._id}
                            >

                                <div>

                                    <h3>
                                        {commit.message}
                                    </h3>

                                    <p>
                                        By{" "}
                                        <strong>
                                            {commit.author?.username ||
                                                "Unknown user"}
                                        </strong>
                                    </p>

                                </div>


                                <div className="commit-info">

                                    <span>
                                        {commit.commitId}
                                    </span>

                                    <span>
                                        {new Date(
                                            commit.date
                                        ).toLocaleString()}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};

export default RepositoryDetails;