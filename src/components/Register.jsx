import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigte = useNavigate();

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      const response = await fetch("https://roadmap-app-co73.onrender.com/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
        }),
      });
      if (response.ok) {
        setMessage("Registration successful");
        setForm({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigte("/login");
        }, 1000);
      } else {
        const errorData = await response.json();
        if (errorData.detail) {
          setMessage(errorData.detail);
        } else if (errorData.non_field_errors) {
          setMessage(errorData.non_field_errors.join(" "));
        } else if (typeof errorData === "string") {
          setMessage(errorData);
        } else {
          const messages = Object.values(errorData).flat().join(" ");
          setMessage(messages || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-center text-3xl mb-6 text-violet-700 font-medium">
        Register
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
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleOnChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleOnChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleOnChange}
            className="w-full px-3 py-2 border rounded"
            required
            autoComplete="email"
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
        <div>
          <label className="block mb-1 font-medium">Confirm password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
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
          Sign Up
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message === "Registration successful"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
