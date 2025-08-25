import { jsxs, jsx } from "react/jsx-runtime";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
const Footer = () => {
  return /* @__PURE__ */ jsxs("footer", { id: "footer", className: "footer", children: [
    /* @__PURE__ */ jsx("div", { className: "footer-top container" }),
    /* @__PURE__ */ jsxs("div", { className: "copyright container mt-4 text-center", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        /* @__PURE__ */ jsx("span", { children: "Copyright" }),
        " ",
        /* @__PURE__ */ jsx("strong", { className: "sitename px-1", children: "Casa de Valientes" }),
        " ",
        /* @__PURE__ */ jsx("span", { children: "All Rights Reserved" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "credits", children: [
        "Designed by ",
        /* @__PURE__ */ jsx("a", { href: "", children: "The Glory of God" })
      ] })
    ] })
  ] });
};
const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Quienes somos?" },
  { href: "/devocionales", label: "Devocionales" },
  { href: "/category.html", label: "Podcast y mas" },
  { href: "/author-profile.html", label: "Libros" },
  { href: "/contact.html", label: "Contact" }
];
const Header = () => {
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (href) => {
    if (href === "/") return url === "/";
    return url.startsWith(href.replace(".html", ""));
  };
  return /* @__PURE__ */ jsxs("header", { id: "header", className: "header position-relative", children: [
    /* @__PURE__ */ jsx("div", { className: "container-fluid container-xl position-relative", children: /* @__PURE__ */ jsxs("div", { className: "top-row d-flex align-items-center justify-content-between", children: [
      /* @__PURE__ */ jsxs("a", { href: "#", className: "logo d-flex align-items-end", children: [
        /* @__PURE__ */ jsx("h1", { className: "sitename", style: { fontFamily: "serif" }, children: "Dilo de parte de Dios" }),
        /* @__PURE__ */ jsx("span", {})
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "social-links", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.facebook.com/share/1MD6hDKdce/?mibextid=wwXIfr",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "facebook",
              children: /* @__PURE__ */ jsx("i", { className: "bi bi-facebook" })
            }
          ),
          /* @__PURE__ */ jsx("a", { href: "#", className: "twitter", children: /* @__PURE__ */ jsx("i", { className: "bi bi-twitter" }) }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.instagram.com/dilodepartededios?igsh=ODU0dHc1bnVhNGd2",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "instagram",
              children: /* @__PURE__ */ jsx("i", { className: "bi bi-instagram" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "search-form ms-4", children: [
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search...", className: "form-control" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn", children: /* @__PURE__ */ jsx("i", { className: "bi bi-search" }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "nav-wrap", children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center position-relative container", children: /* @__PURE__ */ jsxs("nav", { id: "navmenu", className: `navmenu ${mobileMenuOpen ? "open" : ""}`, children: [
      /* @__PURE__ */ jsx("ul", { style: { display: mobileMenuOpen ? "block" : "" }, children: navLinks.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: link.href, className: isActive(link.href) ? "active" : "", onClick: () => setMobileMenuOpen(false), children: link.label }) }, link.href)) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "mobile-nav-toggle d-xl-none",
          onClick: () => setMobileMenuOpen((open) => !open),
          "aria-label": mobileMenuOpen ? "Cerrar menú" : "Abrir menú",
          style: {
            background: "none",
            border: "none",
            fontSize: "2rem",
            color: "#333",
            cursor: "pointer"
          },
          children: /* @__PURE__ */ jsx("i", { className: `bi ${mobileMenuOpen ? "bi-x" : "bi-list"}` })
        }
      )
    ] }) }) })
  ] });
};
export {
  Footer as F,
  Header as H
};
