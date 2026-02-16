interface MenuItem {
  id: number;
  title: string;
  link: string;
  has_dropdown: boolean;
  sub_menus?: { link: string; title: string }[];
}

const menu_data: MenuItem[] = [
  {
    id: 1,
    title: "Home",
    link: "/",
    has_dropdown: false,
  },
  {
    id: 2,
    title: "Features",
    link: "/#features",
    has_dropdown: false,
  },
  {
    id: 3,
    title: "Pricing",
    link: "/#pricing",
    has_dropdown: false,
  },
  {
    id: 4,
    title: "Data Coverage",
    link: "/data-coverage",
    has_dropdown: false,
  },
  // The "Dashboard" link only appears if logged in (handle this in the Header component)
];

export default menu_data;