import React, {useState, useContext} from "react";
import TextEditor from "./TextEditor";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import {v4 as uuidV4} from "uuid";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" Component={Login}/>
                <Route path="/register" Component={Register}/>
                <Route path="/dashboard" Component={Dashboard}/>
                <Route
                    path="/dashboard/documents"
                    element={<Navigate to={`/documents/${uuidV4()}`}/>}
                />
                <Route path="/" element={<Navigate to={`/dashboard`}/>}/>
                <Route path="/documents/:id" element={<TextEditor/>}/>
            </Routes>
        </Router>
    );
}

export default App;
