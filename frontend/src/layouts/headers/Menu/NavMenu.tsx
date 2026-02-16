"use client";
import menu_data from "@/data/home-data/MenuData";
import Link from "next/link.js";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

import logo from "@/assets/images/logo/logo_01.svg";

const NavMenu = () => {
    const pathname = usePathname();
    const [navTitle, setNavTitle] = useState("");
    
    // User State - using 99sellers storage key
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('99sellers_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
    }, []);

    const openMobileMenu = (menu: any) => {
        if (navTitle === menu) {
            setNavTitle("");
        } else {
            setNavTitle(menu);
        }
    };

    return (
        <ul className="navbar-nav align-items-lg-center">
            <li className="d-block d-lg-none">
                <div className="logo">
                    <Link href="/" className="d-block">
                        <Image src={logo} alt="" />
                    </Link>
                </div>
            </li>

            {/* 1. Always Visible Dashboard Link (For Investors) */}
            <li className="nav-item dashboard-menu">
                <Link className="nav-link" href="/search">
                    Dashboard
                </Link>
            </li>

            {/* 2. CONDITIONAL: Admin Link */}
            {user?.userType === 'Admin' && (
                <li className="nav-item">
                    <Link className="nav-link text-danger fw-bold" href="/admin">
                        Admin Panel
                    </Link>
                </li>
            )}

            {/* 3. Standard Menu Items from MenuData.ts */}
            {menu_data.map((menu: any) => (
                <li
                    key={menu.id}
                    className={`nav-item dropdown ${menu.class_name} ${menu.title === "Home" ? "no-dropdown" : ""}`}
                >
                    <Link
                        href={menu.link}
                        className={`nav-link ${menu.has_dropdown && menu.title !== "Home" ? "dropdown-toggle" : ""} 
                        ${pathname === menu.link ? "active" : ""} ${navTitle === menu.title ? "show" : ""}`}
                        onClick={() => menu.title !== "Home" && openMobileMenu(menu.title)}
                    >
                        {menu.title}
                    </Link>
                    
                    {/* Dropdown Logic */}
                    {menu.has_dropdown && menu.title !== "Home" && (
                        <ul className={`dropdown-menu ${navTitle === menu.title ? "show" : ""}`}>
                            {menu.sub_menus &&
                                menu.sub_menus.map((sub_m: any, i: any) => (
                                    <li key={i}>
                                        <Link
                                            href={sub_m.link}
                                            className={`dropdown-item ${pathname === sub_m.link ? "active" : ""}`}
                                        >
                                            <span>{sub_m.title}</span>
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default NavMenu;