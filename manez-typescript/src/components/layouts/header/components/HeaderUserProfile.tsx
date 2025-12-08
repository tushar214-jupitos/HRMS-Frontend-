"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import avatarImg from "../../../../../public/assets/images/avatar/avatar.png";

import UserIcon from "@/svg/header-svg/Profile/UserIcon";
import ChatIcon from "@/svg/header-svg/Profile/ChatIcon";
import EmailIcon from "@/svg/header-svg/Profile/EmailIcon";
import AddAccountIcon from "@/svg/header-svg/Profile/AddAccountIcon";
import LogOut from "@/svg/header-svg/Profile/LogOut";

// Props
type TUserProps = {
  handleShowUserDrowdown: () => void;
  isOpenUserDropdown: boolean;
};

// API response type
interface IUserResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    role: string;
    phone: string;
    department: string | null;
  };
}

const HeaderUserProfile = ({
  handleShowUserDrowdown,
  isOpenUserDropdown,
}: TUserProps) => {
  const [user, setUser] = useState<IUserResponse | null>(null);

  // -----------------------------
  // Fetch User (Authenticated)
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Read token from storage
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        if (!token) {
          console.warn("No access token found.");
          return;
        }

        const res = await fetch(
          "https://cichoriaceous-kristeen-unnormally.ngrok-free.dev/api/users/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
             // "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user data.");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="nav-item relative">
      {/* CLICKABLE PROFILE */}
      <Link id="userportfolio" href="#" onClick={handleShowUserDrowdown}>
        <div className="user__portfolio">
          <div className="user__portfolio-thumb">
            <Image src={avatarImg} width={40} height={40} alt="avatar" />
          </div>

          <div className="user__content">
            <h5>
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </h5>
            <span>{user ? user.email : "Fetching..."}</span>
          </div>
        </div>
      </Link>

      {/* DROPDOWN MENU */}
      {isOpenUserDropdown && (
        <div
          className={`user__dropdown ${
            isOpenUserDropdown ? "user-enable" : ""
          }`}
        >
          <ul>
            <li>
              <Link href="/hrm/employee-profile">
                <UserIcon />
                Profile
              </Link>
            </li>

            <li>
              <Link href="/apps/app-chat">
                <ChatIcon />
                Chat
              </Link>
            </li>

            <li>
              <Link href="/apps/email-inbox">
                <EmailIcon />
                Inbox
              </Link>
            </li>

            <li>
              <Link href="/auth/signup-basic">
                <AddAccountIcon />
                Add Account
              </Link>
            </li>

            <li>
              <Link href="/auth/signin-basic">
                <LogOut />
                Log Out
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HeaderUserProfile;
