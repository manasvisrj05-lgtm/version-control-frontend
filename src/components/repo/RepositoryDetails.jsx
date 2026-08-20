import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./repositoryDetails.css";

const RepositoryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [repository, setRepository] = useState(null);
    const [commits, setCommits] = useState([]);

    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);
    const [error, setError] = useState("");

    // ------------------------------------------------
    // FETCH REPOSITORY + COMMITS
    // ------------------------------------------------

    useEffect(() => {
        const fetchRepository = async () => {
            try {
                const repositoryResponse = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/repo/${id}`
                );

                if (!repositoryResponse.ok) {
                    throw new Error("Repository not found");
                }

                const repositoryData =
                    await repositoryResponse.json();

                setRepository(repositoryData);

                const commitsResponse = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/commit/repository/${id}`
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
    }, [id]);


    // ------------------------------------------------
    // FETCH FILES / FOLDERS
    // ------------------------------------------------

    const fetchFiles = async (path = "") => {
        try {
            setFilesLoading(true);

            const url =
                `${import.meta.env.VITE_BACKEND_URL}/repo/${id}/files` +
                (path ? `?path=${encodeURIComponent(path)}` : "");

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Unable to fetch repository files");
            }

            const data = await response.json();

            console.log("Repository files:", data);

            setFiles(data.files || []);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setFilesLoading(false);
        }
    };


    // Load root files when repository opens
    useEffect(() => {
        fetchFiles("");
    }, [id]);


    // ------------------------------------------------
    // OPEN FOLDER
    // ------------------------------------------------

    const openFolder = async (folderName) => {

        const newPath = currentPath
            ? `${currentPath}/${folderName}`
            : folderName;

        setCurrentPath(newPath);
        setSelectedFile(null);

        await fetchFiles(newPath);
    };


    // ------------------------------------------------
    // GO BACK ONE FOLDER
    // ------------------------------------------------

    const goBack = async () => {

        if (!currentPath) {
            return;
        }

        const parts = currentPath.split("/");

        parts.pop();

        const newPath = parts.join("/");

        setCurrentPath(newPath);
        setSelectedFile(null);

        await fetchFiles(newPath);
    };


    // ------------------------------------------------
    // OPEN FILE
    // ------------------------------------------------

    const openFile = async (fileName) => {

        const filePath = currentPath
            ? `${currentPath}/${fileName}`
            : fileName;

        try {

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/repo/${id}/file?path=${encodeURIComponent(filePath)}`
            );

            if (!response.ok) {
                throw new Error("Unable to fetch file");
            }

            const data = await response.json();

            console.log("File:", data);

            setSelectedFile(data);

        } catch (err) {

            console.error(err);
            setError(err.message);

        }
    };


    // ------------------------------------------------
    // LOADING / ERROR
    // ------------------------------------------------

    if (loading) {
        return <h2>Loading repository...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    if (!repository) {
        return <h2>Repository not found</h2>;
    }


    // ------------------------------------------------
    // UI
    // ------------------------------------------------

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


            {/* FILES */}

            <div className="files-section">

                <h2>Files</h2>

                {/* Current path */}

                <div className="file-path">

                    <strong>
                        📁 {currentPath || "root"}
                    </strong>

                    {currentPath && (
                        <button onClick={goBack}>
                            ← Back
                        </button>
                    )}

                </div>


                {filesLoading ? (

                    <p>Loading files...</p>

                ) : files.length === 0 ? (

                    <p>No files in this directory.</p>

                ) : (

                    <div className="file-list">

                        {files.map((file) => (

                            <div
                                key={file.name}
                                className="file-item"
                                onClick={() => {

                                    if (file.type === "folder") {
                                        openFolder(file.name);
                                    } else {
                                        openFile(file.name);
                                    }

                                }}
                                style={{
                                    cursor: "pointer"
                                }}
                            >

                                {file.type === "folder"
                                    ? "📁"
                                    : "📄"}

                                {" "}

                                {file.name}

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* FILE CONTENT */}

            {selectedFile && (

                <div className="file-content-section">

                    <div className="file-content-header">

                        <h2>
                            📄 {selectedFile.name}
                        </h2>

                        <span>
                            {selectedFile.path}
                        </span>

                    </div>

                    <pre className="file-content">
                        {selectedFile.content}
                    </pre>

                </div>

            )}


            {/* COMMITS */}

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