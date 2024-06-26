import React, {useState, useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const [quotes, setQuotes] = useState([]);
    const navigate = useNavigate();

    async function showQuotes() {
        const req = await fetch("http://localhost:3001/api/quotes", {
            headers: {"x-access-token": localStorage.getItem("token")},
        });

        const data = await req.json();
        if (data.status === "ok") {
            setQuotes(data.quotes);
        } else {
            alert(data.error);
        }
    }

    async function handleDelete(quoteId) {
        const req = await fetch(`http://localhost:3001/api/quotes/${quoteId}`, {
            method: "DELETE",
            headers: {"x-access-token": localStorage.getItem("token")},
        });

        const data = await req.json();
        if (data.status === "ok") {
            setQuotes(quotes.filter((quote) => quote._id !== quoteId));
        } else {
            alert(data.error);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const user = jwtDecode(token);
            if (!user) {
                localStorage.removeItem("token");
                navigate("/login", {replace: true});
            } else {
                showQuotes();
            }
        }
    }, [navigate]);

    function handleLogin() {
        window.location.href = "http://localhost:3000/login";
    }

    function handleDocument() {
        window.location.href = "http://localhost:3000/dashboard/documents";
    }

    function handleLogout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Your Documents:</h1>
            <ul className="list-group mb-4">
                {quotes.length > 0 ? (
                    quotes.map((quote, index) => (
                        <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <a href={quote.quote} className="text-decoration-none">
                                {quote.quote}
                            </a>
                            <button
                                onClick={() => handleDelete(quote._id)}
                                className="btn btn-danger btn-sm"
                            >
                                Delete
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="list-group-item">
                        No documents saved or not logged in
                    </li>
                )}
            </ul>
            <div className="d-flex gap-2">
                <button onClick={handleDocument} className="btn btn-primary">
                    Create new document
                </button>
                <button onClick={handleLogin} className="btn btn-success">
                    Log in
                </button>
                <button onClick={handleLogout} className="btn btn-warning">
                    Log out
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
