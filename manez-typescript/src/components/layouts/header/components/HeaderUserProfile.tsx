"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import avatarImg from "../../../../../public/assets/images/avatar/avatar.png";

import UserIcon from "@/svg/header-svg/Profile/UserIcon";
import ChatIcon from "@/svg/header-svg/Profile/ChatIcon";
import EmailIcon from "@/svg/header-svg/Profile/EmailIcon";
//import AddAccountIcon from "@/svg/header-svg/Profile/SettingIcon";
import LogOut from "@/svg/header-svg/Profile/LogOut";
import SettingIcon from "@/svg/header-svg/Profile/SettingIcon";

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
    is_active: boolean;
  };
}

const HeaderUserProfile = ({
  handleShowUserDrowdown,
  isOpenUserDropdown,
}: TUserProps) => {
  const [user, setUser] = useState<IUserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Fetch User (Authenticated)
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "https://cichoriaceous-kristeen-unnormally.ngrok-free.dev/api/users/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Conditional render of profile data or loading spinner
  const renderProfileInfo = () => {
    if (loading) {
      return <span>Loading...</span>;
    }

    if (error) {
      return <span className="text-red-500">Error: {error}</span>;
    }

    if (user) {
      return (
        <>
          <h5>{`${user.first_name} ${user.last_name}`}</h5>
          <span>{user.email}</span>
         {/* / <div>{user.profile.role}</div> */}
          {/* {user.profile.phone && <div>{user.profile.phone}</div>} */}
        </>
      );
    }

    return <span>No user data available</span>;
  };

  return (
    <div className="nav-item relative">
      {/* CLICKABLE PROFILE */}
      <Link id="userportfolio" href="#" onClick={handleShowUserDrowdown}>
        <div className="user__portfolio">
          <div className="user__portfolio-thumb">
            <Image src={avatarImg} width={40} height={40} alt="avatar" />
          </div>

          <div className="user__content">{renderProfileInfo()}</div>
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
              <Link href="/setting">
                <SettingIcon />
                Setting
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
