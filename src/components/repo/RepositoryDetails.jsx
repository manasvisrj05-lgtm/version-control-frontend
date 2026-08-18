import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./repositoryDetails.css";

const RepositoryDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [repository, setRepository] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchRepository = async () => {

            try {

                const response = await fetch(
                    `http://localhost:3000/repo/${id}`
                );

                if (!response.ok) {
                    throw new Error("Repository not found");
                }

                const data = await response.json();

                console.log("Repository:", data);

                setRepository(data);

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

        </div>
    );
};

export default RepositoryDetails;