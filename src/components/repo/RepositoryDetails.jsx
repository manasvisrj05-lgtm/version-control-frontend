import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./repositoryDetails.css";

const RepositoryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [repository, setRepository] = useState(null);
    const [commits, setCommits] = useState([]);

    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);

    const [selectedCommit, setSelectedCommit] = useState(null);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchRepository = async () => {
            try {
                setLoading(true);
                setError("");

                const repositoryResponse = await fetch(
                    `${BACKEND_URL}/repo/${id}`
                );
                if (!repositoryResponse.ok) {
                    throw new Error("Repository not found");
                }

                const repositoryData =
                    await repositoryResponse.json();

                setRepository(repositoryData);

                const commitsResponse = await fetch(
                    `${BACKEND_URL}/commit/repository/${id}`
                );

                if (!commitsResponse.ok) {
                    throw new Error("Unable to fetch commits");
                }

                const commitsData =
                    await commitsResponse.json();

                setCommits(commitsData.commits || []);

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRepository();
    }, [id, BACKEND_URL]);

    const fetchCurrentRepositoryFiles = async (path = "") => {
        try {
            setFilesLoading(true);
            setError("");
            const url =
                `${BACKEND_URL}/repo/${id}/files` +
                (path
                    ? `?path=${encodeURIComponent(path)}`
                    : "");

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch repository files"
                );
            }

            const data = await response.json();

            console.log(
                "Current repository files:",
                data
            );

            setFiles(data.files || []);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setFilesLoading(false);
        }
    };


    const fetchCommitFiles = async (
        commitId,
        path = ""
    ) => {
        try {
            setFilesLoading(true);
            setError("");

            const url =
                `${BACKEND_URL}/commit/${commitId}/files` +
                (path
                    ? `?path=${encodeURIComponent(path)}`
                    : "");
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    "Unable to fetch commit files"
                );
            }

            const data = await response.json();
            console.log(
                "Commit files:",
                data
            );
            setFiles(data.files || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setFilesLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentRepositoryFiles("");
    }, [id]);

    const openCommit = async (commit) => {
        setSelectedCommit(commit);
        setCurrentPath("");
        setSelectedFile(null);

        await fetchCommitFiles(
            commit.commitId,
            ""
        );

        setTimeout(() => {
            const filesSection =
                document.getElementById("repository-files-section");

            if (filesSection) {
                filesSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 100);
    };

    const backToCurrentRepository = async () => {
        setSelectedCommit(null);
        setCurrentPath("");
        setSelectedFile(null);

        await fetchCurrentRepositoryFiles("");
    };


    const openFolder = async (folderName) => {
        const newPath = currentPath
            ? `${currentPath}/${folderName}`
            : folderName;
        setCurrentPath(newPath);
        setSelectedFile(null);

        if (selectedCommit) {
            await fetchCommitFiles(
                selectedCommit.commitId,
                newPath
            );
        } else {
            await fetchCurrentRepositoryFiles(
                newPath
            );
        }
    };

    const goBack = async () => {
        if (!currentPath) {
            return;
        }
        const parts = currentPath.split("/");
        parts.pop();
        const newPath = parts.join("/");
        setCurrentPath(newPath);
        setSelectedFile(null);
        if (selectedCommit) {
            await fetchCommitFiles(
                selectedCommit.commitId,
                newPath
            );
        } else {
            await fetchCurrentRepositoryFiles(
                newPath
            );
        }
    };

    const openCurrentFile = async (filePath) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/repo/${id}/file?path=${encodeURIComponent(filePath)}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch file"
                );
            }

            const data = await response.json();
            console.log(
                "Current file:",
                data
            );
            setSelectedFile(data);
        } catch (err) {
            console.error(err);
            setError(err.message);

        }
    };

    const openCommitFile = async (
        commitId,
        filePath
    ) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/commit/${commitId}/file?path=${encodeURIComponent(filePath)}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch commit file"
                );
            }
            const data = await response.json();
            console.log(
                "Commit file:",
                data
            );
            setSelectedFile(data);
        } catch (err) {
            console.error(err);
            setError(err.message);

        }
    };

    const openFile = async (fileName) => {
        const filePath = currentPath
            ? `${currentPath}/${fileName}`
            : fileName;
        setSelectedFile(null);

        if (selectedCommit) {
            await openCommitFile(
                selectedCommit.commitId,
                filePath
            );
        } else {
            await openCurrentFile(
                filePath
            );
        }
    };


    if (loading) {
        return (
            <h2>
                Loading repository...
            </h2>
        );
    }


    if (error) {
        return (
            <div>
                <h2>{error}</h2>
                <button
                    onClick={() => {
                        setError("");
                        window.location.reload();
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }


    if (!repository) {
        return (
            <h2>
                Repository not found
            </h2>
        );
    }


    return (
        <div className="repository-page">
            <div className="repository-header">
                <div>
                    <h1>
                        {repository.name}
                    </h1>
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
                        navigate(
                            `/repo/${id}/issues`
                        )
                    }
                >
                    Issues
                </button>
            </div>

            {selectedCommit && (
                <div className="commit-view-banner">
                    <div className="commit-view-info">
                        <div className="commit-view-title">
                            <span className="commit-view-icon">
                                <i className="fa-solid fa-code-commit"></i>
                            </span>

                            <div>
                                <strong>
                                    Viewing commit
                                </strong>
                                <h3>
                                    {selectedCommit.message}
                                </h3>
                            </div>
                        </div>

                        <div className="commit-view-meta">
                            <span>
                                {selectedCommit.commitId}
                            </span>
                            <span>
                                {new Date(
                                    selectedCommit.date
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        className="back-current-btn"
                        onClick={backToCurrentRepository}
                    >
                         Back to current repository
                    </button>

                </div>
            )}

            <div className="files-section" id="repository-files-section">
                <h2>
                    {selectedCommit
                        ? "Files in this commit"
                        : "Current Files"}
                </h2>
                <div className="file-path">
                    <strong>
                        <i className="fa-solid fa-folder"></i>{" "}
                        {currentPath || "root"}
                    </strong>
                    {currentPath && (
                        <button
                            onClick={goBack}
                        >
                            ← Back
                        </button>
                    )}

                </div>

                {filesLoading ? (
                    <p>
                        Loading files...
                    </p>
                ) : files.length === 0 ? (
                    <p>
                        No files in this directory.
                    </p>
                ) : (
                    <div className="file-list">
                        {files.map((file) => (
                            <div
                                key={`${file.type}-${file.name}`}
                                className="file-item"
                                onClick={() => {
                                    if (
                                        file.type ===
                                        "folder"
                                    ) {
                                        openFolder(
                                            file.name
                                        );
                                    } else {
                                        openFile(
                                            file.name
                                        );
                                    }
                                }}
                                style={{
                                    cursor:
                                        "pointer"
                                }}
                            >
                               <i className={
                                        file.type === "folder"
                                            ? "fa-solid fa-folder file-icon folder-icon"
                                            : "fa-solid fa-file file-icon"
                                    }
                                ></i>
                                <span className="file-name">
                                    {file.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="commit-section">
                <h2>
                    Commits
                </h2>
                {commits.length === 0 ? (
                    <p>
                        No commits yet.
                    </p>
                ) : (
                    <div className="commit-list">
                        {commits.map(
                            (commit) => (
                                <div
                                    className=
                                        "commit-card"
                                    key={
                                        commit._id
                                    }
                                >
                                    <div>
                                        <h3>
                                            {
                                                commit.message
                                            }
                                        </h3>
                                        <p>
                                            By{" "}
                                            <strong>
                                                {
                                                    commit
                                                        .author?.username ||
                                                    "Unknown user"
                                                }
                                            </strong>
                                        </p>
                                        <small>
                                            {
                                                commit.commitId
                                            }
                                        </small>
                                    </div>
                                    <div
                                        className=
                                            "commit-info"
                                    >
                                        <span>
                                            {
                                                new Date(
                                                    commit.date
                                                ).toLocaleString()
                                            }
                                        </span>
                                        <button
                                            className="view-commit-btn"
                                            onClick={() =>
                                                openCommit(
                                                    commit
                                                )
                                            }
                                        >
                                            View commit
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepositoryDetails;