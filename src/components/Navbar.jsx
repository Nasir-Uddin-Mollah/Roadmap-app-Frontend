import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar(props) {
  const navigate = useNavigate();
  let brandName = props.brandName || "Brand Name";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  async function handleLogout() {
    try {
      await fetch("https://roadmap-app-co73.onrender.com/users/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.log("Logout failed:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `https://roadmap-app-co73.onrender.com/users/list/?id=${user_id}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        const data = await response.json();
        setUserName(
          data.results[0].first_name + " " + data.results[0].last_name
        );
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    {
      token && fetchUser();
    }
  }, [token]);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} size-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} size-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                className="ml-9 sm:ml-0 sm:text-xl font-extrabold text-gray-300 hover:text-white"
              >
                {brandName}
              </Link>
            </div>
          </div>
          {token && user_id ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <div className="text-white sm:font-medium sm:text-xl">Hello, {userName}</div>
              {/* Profile dropdown */}
              <div className="relative ml-3" ref={profileMenuRef}>
                <div>
                  <button
                    type="button"
                    className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden cursor-pointer"
                    id="user-menu-button"
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                  >
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="size-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
                {/* Dropdown menu, show only if open */}
                {profileMenuOpen && (
                  <div
                    className={`absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-0"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-1"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex space-x-2">
              <Link
                to="/register"
                className={`block rounded-md px-3 py-2 text-base font-medium text-white`}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu, show only if open */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {token && user_id ? null : (
              <>
                <Link
                  to="/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-white"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  brandName: PropTypes.string,
};
