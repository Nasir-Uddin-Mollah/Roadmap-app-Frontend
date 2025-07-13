import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://roadmap-app-co73.onrender.com/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        setMessage("Login successful");
        setForm({
          username: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        const errorData = await response.json();
        if (errorData.detail) {
          setMessage(errorData.detail);
        } else if (typeof errorData === "string") {
          setMessage(errorData);
        } else {
          const messages = Object.values(errorData).flat().join(" ");
          setMessage(messages || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.log("login error", error);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded shadow-md h-[60vh]">
      <h1 className="text-center text-3xl mb-6 text-violet-700 font-medium">
        Login
      </h1>
      <form onSubmit={handleOnSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleOnChange}
            className="w-full px-3 py-2 border rounded"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleOnChange}
            className="w-full px-3 py-2 border rounded"
            required
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-800 cursor-pointer"
        >
          Login
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message === "Login successful" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
