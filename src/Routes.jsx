import React, { useEffect } from "react";
import {useNavigate, useRoutes} from 'react-router-dom'

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Repo from "./components/repo/Repo";
import CreateRepo from "./components/repo/CreateRepo";
import Issues from "./components/issue/Issues";
import RepositoryDetails from "./components/repo/RepositoryDetails";

import { useAuth } from "./authContext";

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        const userIdFromStorage = localStorage.getItem("userId");

        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

        if(!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname))
        {
            navigate("/auth");
        }

        if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path:"/profile",
            element:<Profile/>
        },
        {
            path:"/repo/star",
            element:<Repo />
        },
        {
            path:"/repo/create",
            element:<CreateRepo />
        },
        {
            path: "/repo/:id/issues",
            element: <Issues />
        },
        {
            path: "/repo/:id",
            element: <RepositoryDetails />
        }
    ]);

    return element;
}

export default ProjectRoutes;