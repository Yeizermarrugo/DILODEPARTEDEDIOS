import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { H as Header, F as Footer } from "./Header-BwnaQMLx.js";
import { useState, useEffect } from "react";
/* empty css              */
import DevocionalDetails from "./DevocionalDetails-CpvTjuMy.js";
import "@inertiajs/react";
import "./devocionalDetails-D5k2N-jf.js";
const colorArray = [
  // '#FF5252',
  "#ff990086",
  "#c511627c",
  "#ffd6408c",
  "#0090ea9a",
  "#fc00009f",
  "#00e67791",
  "#7c4dff85",
  "#ff408085"
  // '#FFD600',
  // '#69F0AE',
  // '#00B8D4',
  // '#2979FF',
  // '#304FFE',
  // '#AA00FF',
  // '#6200EA',
  // '#0091EA',
  // '#00BFAE',
  // '#64DD17',
  // '#AEEA00',
];
const categoryColorMap = {};
function DevocionalCard({ devocionales }) {
  function getPlainTextAfterH1(html) {
    const regex = /<h1\b[^>]*>.*?<\/h1>/i;
    const match = html.match(regex);
    if (!match) return "";
    const index = (match.index ?? 0) + match[0].length;
    const afterH1 = html.slice(index);
    const plainText = afterH1.replace(/<[^>]+>/g, "").trim();
    return plainText;
  }
  function stringToColor(str) {
    const normalized = str.trim().toLowerCase();
    if (categoryColorMap[normalized]) {
      return categoryColorMap[normalized];
    }
    for (const color of colorArray) {
      if (!Object.values(categoryColorMap).includes(color)) {
        categoryColorMap[normalized] = color;
        return color;
      }
    }
    return "#FFFFFF";
  }
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }, children: devocionales.map((dev, idx) => /* @__PURE__ */ jsxs(
    Card,
    {
      sx: {
        width: 200,
        display: "flex",
        flexDirection: "column",
        height: 350,
        backgroundColor: `${dev.categoria ? stringToColor(dev.categoria) : "#ffffffff"}`
      },
      children: [
        /* @__PURE__ */ jsx(
          CardMedia,
          {
            component: "img",
            image: dev.imagen,
            alt: "Descripción",
            sx: {
              height: 150,
              // Altura fija para todas las imágenes
              width: "100%",
              objectFit: "cover",
              // Recorta y centra la imagen uniformemente
              objectPosition: "center"
            }
          }
        ),
        /* @__PURE__ */ jsxs(CardContent, { sx: { flex: "1 1 auto", overflow: "hidden", paddingBottom: 0 }, children: [
          /* @__PURE__ */ jsx(Typography, { sx: { color: "rgba(56, 56, 56, 1)" }, gutterBottom: true, variant: "h5", component: "div", children: dev.titulo }),
          /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body2",
              sx: { color: "rgba(119, 119, 119, 0.81)", padding: 0, margin: 0 },
              dangerouslySetInnerHTML: { __html: getPlainTextAfterH1(dev.contenido).split(" ").slice(0, 20).join(" ") + "..." }
            }
          )
        ] })
      ]
    },
    idx
  )) });
}
function Devocionals() {
  const [categories, setCategories] = useState([]);
  const [devocionales, setDevocionales] = useState([]);
  const [latestDevocionales, setLatestDevocionales] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [devocionalSeleccionado, setDevocionalSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState(searchTerm);
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    let url = "";
    if (query.trim() !== "") {
      url = `/devocionales-search?search=${encodeURIComponent(query)}&page=${page}`;
    } else if (selectedCategory) {
      url = `/devocionales/categoria/${encodeURIComponent(selectedCategory)}?page=${page}`;
    } else {
      url = `/devocionales-search?page=${page}`;
    }
    fetch(url, { signal: controller.signal }).then((r) => r.json()).then((data) => {
      var _a;
      console.log("URL enviada:", url);
      console.log("Respuesta backend:", data);
      if (!selectedCategory && query.trim() === "") {
        setCategories(data.categorias || []);
        setTotal(((_a = data.devocionales) == null ? void 0 : _a.total) || 0);
      }
      if (data.devocionales) {
        setDevocionales(data.devocionales.data || []);
        setPagination(data.devocionales);
      } else if (data.data) {
        setDevocionales(data.data || []);
        setPagination(data);
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Error en fetch:", err);
      }
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedCategory, page, query]);
  useEffect(() => {
    fetch("devocionals-latest").then((response) => response.json()).then((data) => {
      setLatestDevocionales(data);
    }).catch((error) => {
      console.error("Error fetching latest devocionales:", error);
    });
  }, []);
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
    setSearchTerm("");
    setQuery("");
  };
  const abrirModal = (devocional) => {
    setDevocionalSeleccionado(devocional);
    setModalOpen(true);
    window.history.pushState({}, "", `?devocional=${devocional.id}`);
  };
  const cerrarModal = () => {
    setModalOpen(false);
    setDevocionalSeleccionado(null);
    window.history.pushState({}, "", window.location.pathname);
  };
  const obtenerPrimerEtiqueta = (html) => {
    const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
    if (match) {
      const innerText = match[2].replace(/<[^>]+>/g, "");
      return innerText;
    }
    return "";
  };
  const TituloDevocional = ({ contenido }) => {
    const titulo = obtenerPrimerEtiqueta(contenido);
    return /* @__PURE__ */ jsx("div", { style: { justifyContent: "start", display: "flex", paddingTop: "20px" }, dangerouslySetInnerHTML: { __html: titulo } });
  };
  const renderPaginator = () => {
    if (!pagination.last_page || pagination.last_page <= 1) return null;
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, (pagination.current_page || 1) - 2);
    const end = Math.min(pagination.last_page, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `paginator-btn ${pagination.current_page === i ? "active" : ""}`,
            onClick: () => setPage(i),
            disabled: pagination.current_page === i,
            style: {
              margin: "0 3px",
              padding: "5px 10px",
              background: pagination.current_page === i ? "#007bff" : "#f0f0f0",
              color: pagination.current_page === i ? "#fff" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: pagination.current_page === i ? "default" : "pointer"
            },
            children: i
          },
          i
        )
      );
    }
    return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", margin: "20px 0" }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setPage((pagination.current_page || 2) - 1),
          disabled: pagination.current_page === 1,
          style: { marginRight: "5px" },
          children: "« Anterior"
        }
      ),
      pages,
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setPage((pagination.current_page || 0) + 1),
          disabled: pagination.current_page === pagination.last_page,
          style: { marginLeft: "5px" },
          children: "Siguiente »"
        }
      )
    ] });
  };
  const PAGE_LIMIT = 15;
  const showPaginator = () => {
    if (!searchTerm.trim()) {
      return pagination.last_page && pagination.last_page > 1;
    }
    return devocionales.length > PAGE_LIMIT && (pagination.last_page ?? 0) > 1;
  };
  const CategoriesWidget = () => /* @__PURE__ */ jsxs("div", { className: "categories-widget widget-item", children: [
    /* @__PURE__ */ jsx("h3", { className: "widget-title", children: "Categories" }),
    /* @__PURE__ */ jsxs("ul", { className: "mt-3", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          className: selectedCategory === null ? "active" : "",
          onClick: () => handleSelectCategory(null),
          style: { background: "none", border: "none", cursor: "pointer", color: "inherit" },
          children: [
            "Todas ",
            /* @__PURE__ */ jsxs("span", { children: [
              "(",
              total,
              ")"
            ] })
          ]
        }
      ) }),
      categories.map((cat) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          className: selectedCategory === cat.categoria ? "active" : "",
          onClick: () => handleSelectCategory(cat.categoria),
          style: { background: "none", border: "none", cursor: "pointer", color: "inherit" },
          children: [
            cat.categoria,
            " ",
            /* @__PURE__ */ jsxs("span", { children: [
              "(",
              cat.count,
              ")"
            ] })
          ]
        }
      ) }, cat.categoria))
    ] })
  ] });
  const RecentPostsWidget = () => /* @__PURE__ */ jsxs("div", { className: "recent-posts-widget widget-item", children: [
    /* @__PURE__ */ jsx("h3", { className: "widget-title", children: "Recent Posts" }),
    latestDevocionales.map((post, idx) => /* @__PURE__ */ jsxs("div", { className: "post-item", children: [
      /* @__PURE__ */ jsx("img", { src: post.imagen, alt: "", className: "flex-shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { style: { color: "#212529" }, className: "recent-post-title", children: /* @__PURE__ */ jsxs("button", { onClick: () => abrirModal(post), children: [
          /* @__PURE__ */ jsx(TituloDevocional, { contenido: post.contenido }),
          /* @__PURE__ */ jsx("time", { dateTime: "2020-01-01", children: post.created_at ? new Date(post.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" })
        ] }) }),
        /* @__PURE__ */ jsx("time", { dateTime: "2020-01-01", children: post.date })
      ] })
    ] }, idx))
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "blog-details-page", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("main", { className: "main", children: [
      /* @__PURE__ */ jsxs("div", { className: "page-title", children: [
        /* @__PURE__ */ jsx("div", { className: "breadcrumbs" }),
        /* @__PURE__ */ jsxs("div", { className: "title-wrapper", children: [
          /* @__PURE__ */ jsx("h1", { children: "Encuentra la respuesta que Dios envía hoy a tu vida" }),
          /* @__PURE__ */ jsxs("p", { style: { fontStyle: "italic" }, children: [
            '“Tal vez no nos damos cuenta, pero Dios no deja de hablarnos" ',
            /* @__PURE__ */ jsx("span", { style: { fontWeight: "bold" }, children: "Job 33:14 TLA" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("div", { className: "mobile-widgets d-block d-lg-none", style: { width: "100%" }, children: /* @__PURE__ */ jsxs("div", { className: "widgets-container", "data-aos": "fade-up", "data-aos-delay": "200", children: [
          /* @__PURE__ */ jsx(CategoriesWidget, {}),
          /* @__PURE__ */ jsx(RecentPostsWidget, {})
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-sm-8", children: /* @__PURE__ */ jsx("section", { id: "blog-details", className: "blog-grid section", children: /* @__PURE__ */ jsx("div", { className: "container", "data-aos": "fade-up", children: loading ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "40px" }, children: /* @__PURE__ */ jsx("div", { id: "preloader", className: "d-flex align-items-center justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Loading..." }) }) }) }) : devocionales.length === 0 ? /* @__PURE__ */ jsx("p", { children: "No hay devocionales para esta búsqueda." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { style: { paddingBottom: "30px", marginBottom: "30px" }, children: /* @__PURE__ */ jsx("h2", { style: { color: "#212529" }, children: searchTerm ? `Resultados de búsqueda "${searchTerm}"` : selectedCategory ? `Categoría - ${selectedCategory}` : "Todos los Devocionales" }) }),
          /* @__PURE__ */ jsx("div", { className: "cards-container", children: devocionales.map((devocional, index) => /* @__PURE__ */ jsx("a", { href: `/devocional/${devocional.id}`, style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(
            DevocionalCard,
            {
              devocionales: [
                {
                  ...devocional,
                  titulo: obtenerPrimerEtiqueta(devocional.contenido),
                  contenido: devocional.contenido
                }
              ]
            },
            index
          ) })) }),
          showPaginator() && renderPaginator()
        ] }) }) }) }),
        modalOpen && devocionalSeleccionado && /* @__PURE__ */ jsx(
          "div",
          {
            className: "modal-overlay",
            style: {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1e3,
              overflow: "auto"
            },
            onClick: cerrarModal,
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                className: "modal-content",
                style: {
                  background: "#fff",
                  padding: "24px",
                  borderRadius: "8px",
                  maxWidth: "800px",
                  width: "100%",
                  position: "relative",
                  maxHeight: "90vh",
                  overflowY: "auto"
                },
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      style: {
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "none",
                        border: "none",
                        fontSize: "1.5em",
                        cursor: "pointer"
                      },
                      onClick: cerrarModal,
                      children: "×"
                    }
                  ),
                  /* @__PURE__ */ jsx(DevocionalDetails, { devocional: devocionalSeleccionado })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "col-lg-4 sidebar d-none d-lg-block", children: /* @__PURE__ */ jsxs("div", { className: "widgets-container", "data-aos": "fade-up", "data-aos-delay": "200", children: [
          /* @__PURE__ */ jsx(CategoriesWidget, {}),
          /* @__PURE__ */ jsx(RecentPostsWidget, {})
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Devocionals as default
};
