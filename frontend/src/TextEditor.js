import React, {useEffect, useRef, useState} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {io} from "socket.io-client";
import {useParams} from "react-router";

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
    [{header: [1, 2, 3, 4, 5, 6, false]}],
    [{font: []}],
    [{list: "ordered"}, {list: "bullet"}],
    ["bold", "italic", "underline"],
    [{color: []}, {background: []}],
    [{script: "sub"}, {script: "super"}],
    [{align: []}],
    ["image", "blockquote", "code-block"],
    ["clean"],
];

export const url = window.location.href;

export default function TextEditor() {
    const {id: documentId} = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    console.log(documentId);

    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    const wrapperRef = useRef();
    useEffect(() => {
        const editor = document.createElement("div");
        wrapperRef.current.appendChild(editor);
        const q = new Quill(editor, {
            theme: "snow",
            modules: {
                toolbar: TOOLBAR_OPTIONS,
            },
        });
        q.enable(false);
        q.setText("Loading...");
        //console.log(q);
        setQuill(q);

        return () => {
            wrapperRef.current.innerHTML = "";
        };
    }, []);

    useEffect(() => {
        if (socket == null || quill == null) return;
        socket.once("load-document", (document) => {
            quill.setContents(document);
            quill.enable();
        });
        socket.emit("get-document", documentId);
    }, [socket, quill, documentId]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents());
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta) => {
            quill.updateContents(delta);
        };
        socket.on("receive-changes", handler);

        return () => {
            socket.off("receive-changes", handler);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return;
            socket.emit("send-changes", delta);
        };
        quill.on("text-change", handler);

        return () => {
            quill.off("text-change", handler);
        };
    }, [socket, quill]);

    /*
    function anmelden() {
      const formData = new URLSearchParams();
      formData.append("email", "matianmc08@gmail.com");
      formData.append("password", "12345678");

      fetch("http://10.80.4.46:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });
    }
  */

    async function addDocument() {
        const url = window.location.href;
        const req = await fetch("http://localhost:3001/api/quote", {
            method: "POST",
            headers: {
                "x-access-token": localStorage.getItem("token"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quote: url,
            }),
        });
    }

    return (
        <>
            <div className="container" ref={wrapperRef}>
                Text Editor
            </div>
            <div class="goBack">
                <button class="goBackButton">
                    <a href="/dashboard" class="goBack2">
                        Go back to Login/Home
                    </a>
                </button>
                <button onClick={addDocument} class="goBackButton">
                    save document to dashboard
                </button>
            </div>
        </>
    );
}
