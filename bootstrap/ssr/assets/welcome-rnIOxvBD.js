import { jsx, jsxs } from "react/jsx-runtime";
import { H as Header, F as Footer } from "./Header-DNwlD0BP.js";
import DevocionalDetails from "./DevocionalDetails-CpvTjuMy.js";
import axios from "axios";
import { useState, useEffect } from "react";
/* empty css              */
import "@inertiajs/react";
import "./devocionalDetails-D5k2N-jf.js";
function MainContent() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
  const [devocionales, setDevocionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [devocionalSeleccionado, setDevocionalSeleccionado] = useState(null);
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState(null);
  const URL = "/youtube/latest";
  useEffect(() => {
    axios.get(URL).then((res) => {
      const data = res.data;
      if (data.items && data.items.length > 0) {
        setVideos(data.items);
        console.log("data: ", data);
      } else {
        setError("No se encontró ningún video.");
      }
    }).catch((err) => {
      console.log("error Youtube API", err);
    });
  }, []);
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
  useEffect(() => {
    let isMounted = true;
    if (loading) {
      fetch("/devocionals-latest").then((res) => res.json()).then((data) => {
        if (isMounted) {
          setDevocionales(data);
          setLoading(false);
          const params = new URLSearchParams(window.location.search);
          const id = params.get("devocional");
          if (id) {
            const encontrado = data.find((d) => String(d.id) === id);
            if (encontrado) {
              setDevocionalSeleccionado(encontrado);
              setModalOpen(true);
            }
          }
        }
      });
    }
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      isMounted = false;
      document.body.style.overflow = "";
    };
  }, [loading, modalOpen]);
  const obtenerPrimerEtiqueta = (html) => {
    const match = html == null ? void 0 : html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
    if (match) {
      return match[0];
    }
    return "";
  };
  const TituloDevocional = ({ contenido }) => {
    const titulo = obtenerPrimerEtiqueta(contenido);
    return /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: titulo } });
  };
  const dev = devocionales.slice(0, 5);
  if (error) return /* @__PURE__ */ jsx("div", { children: error });
  if (loading && !videos) {
    return /* @__PURE__ */ jsx("div", { id: "preloader", className: "d-flex align-items-center justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Loading..." }) }) });
  }
  return /* @__PURE__ */ jsxs("main", { className: "main", children: [
    /* @__PURE__ */ jsx("section", { id: "blog-hero", className: "blog-hero section", children: /* @__PURE__ */ jsx("div", { className: "container", "data-aos": "fade-up", "data-aos-delay": "100", children: /* @__PURE__ */ jsxs("div", { className: "blog-grid", children: [
      /* @__PURE__ */ jsxs("article", { className: "blog-item featured", "data-aos": "fade-up", children: [
        /* @__PURE__ */ jsx("img", { src: (_a = dev[0]) == null ? void 0 : _a.imagen, alt: "Blog Image", className: "img-fluid" }),
        /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
          /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: ((_b = dev[0]) == null ? void 0 : _b.created_at) ? new Date((_c = dev[0]) == null ? void 0 : _c.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" }) }),
          /* @__PURE__ */ jsx("h2", { className: "devocional-title", children: /* @__PURE__ */ jsx("button", { onClick: () => abrirModal(dev[0]), children: /* @__PURE__ */ jsx(TituloDevocional, { contenido: (_d = dev[0]) == null ? void 0 : _d.contenido }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "blog-item", "data-aos": "fade-up", "data-aos-delay": "100", children: [
        /* @__PURE__ */ jsx("img", { src: (_e = dev[1]) == null ? void 0 : _e.imagen, alt: "Blog Image", className: "img-fluid" }),
        /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
          /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: ((_f = dev[1]) == null ? void 0 : _f.created_at) ? new Date((_g = dev[1]) == null ? void 0 : _g.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" }) }),
          /* @__PURE__ */ jsx("h3", { className: "post-title", children: /* @__PURE__ */ jsx("button", { onClick: () => abrirModal(dev[1]), children: /* @__PURE__ */ jsx(TituloDevocional, { contenido: (_h = dev[1]) == null ? void 0 : _h.contenido }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "blog-item", "data-aos": "fade-up", "data-aos-delay": "100", children: [
        /* @__PURE__ */ jsx("img", { src: (_i = dev[2]) == null ? void 0 : _i.imagen, alt: "Blog Image", className: "img-fluid" }),
        /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
          /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: ((_j = dev[2]) == null ? void 0 : _j.created_at) ? new Date((_k = dev[2]) == null ? void 0 : _k.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" }) }),
          /* @__PURE__ */ jsx("h3", { className: "post-title", children: /* @__PURE__ */ jsx("button", { onClick: () => abrirModal(dev[2]), children: /* @__PURE__ */ jsx(TituloDevocional, { contenido: (_l = dev[2]) == null ? void 0 : _l.contenido }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "blog-item", "data-aos": "fade-up", "data-aos-delay": "100", children: [
        /* @__PURE__ */ jsx("img", { src: (_m = dev[3]) == null ? void 0 : _m.imagen, alt: "Blog Image", className: "img-fluid" }),
        /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
          /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: ((_n = dev[3]) == null ? void 0 : _n.created_at) ? new Date((_o = dev[3]) == null ? void 0 : _o.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" }) }),
          /* @__PURE__ */ jsx("h3", { className: "post-title", children: /* @__PURE__ */ jsx("button", { onClick: () => abrirModal(dev[3]), children: /* @__PURE__ */ jsx(TituloDevocional, { contenido: (_p = dev[3]) == null ? void 0 : _p.contenido }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "blog-item", "data-aos": "fade-up", "data-aos-delay": "100", children: [
        /* @__PURE__ */ jsx("img", { src: (_q = dev[4]) == null ? void 0 : _q.imagen, alt: "Blog Image", className: "img-fluid" }),
        /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
          /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: ((_r = dev[4]) == null ? void 0 : _r.created_at) ? new Date((_s = dev[4]) == null ? void 0 : _s.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "" }) }),
          /* @__PURE__ */ jsx("h3", { className: "post-title", children: /* @__PURE__ */ jsx("button", { onClick: () => abrirModal(dev[4]), children: /* @__PURE__ */ jsx(TituloDevocional, { contenido: (_t = dev[4]) == null ? void 0 : _t.contenido }) }) })
        ] })
      ] })
    ] }) }) }),
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
              // Limita el alto
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
    /* @__PURE__ */ jsxs("section", { id: "featured-posts", className: "featured-posts section", children: [
      /* @__PURE__ */ jsxs("div", { className: "section-title container", "data-aos": "fade-up", children: [
        /* @__PURE__ */ jsx("h2", { children: "PRÓXIMAMENTE" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "MENSAJES QUE" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "description-title", children: "TRANSFORMAN" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "container", "data-aos": "fade-up", "data-aos-delay": "100", children: /* @__PURE__ */ jsx("div", { className: "blog-posts-slider swiper init-swiper", children: /* @__PURE__ */ jsx("div", { className: "swiper-wrapper", children: /* @__PURE__ */ jsx("div", { className: "swiper-slide", children: /* @__PURE__ */ jsx("div", { className: "blog-post-item", children: /* @__PURE__ */ jsx("img", { src: "/assets/img/blog/YouTube-Banner.png", alt: "Blog Image" }) }) }) }) }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "category-section", className: "category-section section", style: { background: "#f7f7f7", minHeight: "60vh" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "section-title container", "data-aos": "fade-up", children: [
        /* @__PURE__ */ jsx("h2", { children: "ENSEÑANZA" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "AUDIO CLASES" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "description-title", children: "DE DOCTRINA" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "container py-5", children: /* @__PURE__ */ jsxs("div", { className: "row gy-4 justify-content-center align-items-stretch", children: [
        error && /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx("div", { className: "alert alert-danger", children: error }) }),
        (videos == null ? void 0 : videos.length) === 0 && !error && /* @__PURE__ */ jsx("div", { id: "preloader", className: "d-flex align-items-center justify-content-center", style: { minHeight: "300px" }, children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Loading..." }) }) }),
        videos == null ? void 0 : videos.map((video) => /* @__PURE__ */ jsx("div", { className: "col-lg-3 col-md-6 d-flex", children: /* @__PURE__ */ jsxs("div", { className: "card video-card h-100 w-100 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "ratio ratio-16x9", children: /* @__PURE__ */ jsx(
            "iframe",
            {
              src: `https://www.youtube.com/embed/${video.id.videoId}`,
              title: video.snippet.title,
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              allowFullScreen: true,
              style: { borderRadius: "0.5rem 0.5rem 0 0" }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "card-body d-flex flex-column", children: [
            /* @__PURE__ */ jsx("h5", { className: "card-title", style: { fontWeight: 600 }, children: video.snippet.title }),
            /* @__PURE__ */ jsx("p", { className: "card-text", style: { fontSize: "0.95rem", color: "#555" }, children: video.snippet.description.length > 100 ? video.snippet.description.slice(0, 97) + "..." : video.snippet.description }),
            /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center mt-auto", children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "btn btn-primary btn-sm",
                  style: {
                    background: "linear-gradient(90deg,#0d6efd 0%, #6C63FF 100%)",
                    border: "none"
                  },
                  children: "Ver en YouTube"
                }
              ),
              /* @__PURE__ */ jsx("small", { className: "text-muted", children: new Date(video.snippet.publishedAt).toLocaleDateString() })
            ] })
          ] })
        ] }) }, video.id.videoId)),
        /* @__PURE__ */ jsx("div", { className: "col-lg-3 col-md-6 d-flex align-items-stretch", children: /* @__PURE__ */ jsxs("div", { className: "ver-mas-card d-flex flex-column justify-content-center align-items-center w-100 shadow-sm", children: [
          /* @__PURE__ */ jsx("h4", { className: "mb-3", style: { fontWeight: 700, color: "#6C63FF" }, children: "Playlist completa" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://youtube.com/playlist?list=PLA3_8ty5OhFV-hmTywh6yGTnzlaTpJpBU&si=voOhM9H8Oba3-FD7",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "btn btn-lg btn-gradient",
              children: "Ver más"
            }
          )
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("style", { children: `
        .video-card {
          border-radius: 0.7rem;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .video-card:hover {
          box-shadow: 0 6px 22px rgba(0,0,0,0.14);
          transform: translateY(-2px) scale(1.01);
        }
        .ver-mas-card {
          border-radius: 0.7rem;
          min-height: 100%;
          background: linear-gradient(135deg,#e9ecef 70%, #f7f7f7 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2.5rem 1rem;
        }
        .btn-gradient {
          background: linear-gradient(90deg,#0d6efd 0%, #6C63FF 100%);
          color: #fff;
          border: none;
          border-radius: 2rem;
          font-weight: bold;
          font-size: 1.15rem;
          padding: 0.7rem 2.2rem;
          box-shadow: 0 4px 18px rgba(0,0,0,0.09);
          transition: background .2s, box-shadow .2s;
          text-decoration: none;
        }
        .btn-gradient:hover {
          background: linear-gradient(90deg,#6C63FF 0%, #0d6efd 100%);
          box-shadow: 0 6px 22px rgba(108,99,255,0.18);
        }
        @media (max-width: 991px) {
          .ver-mas-card {
            margin-top: 2rem;
            min-height: 220px;
          }
        }
      ` })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "call-to-action-2", className: "call-to-action-2 section", children: /* @__PURE__ */ jsx("div", { className: "container", "data-aos": "fade-up", "data-aos-delay": "100", children: /* @__PURE__ */ jsxs("div", { className: "advertise-1 d-flex flex-column flex-lg-row align-items-center position-relative gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "content-left flex-grow-1", "data-aos": "fade-right", "data-aos-delay": "200", children: [
        /* @__PURE__ */ jsx("span", { className: "badge text-uppercase mb-2", children: "Don't Miss" }),
        /* @__PURE__ */ jsx("h2", { children: "Revolutionize Your Digital Experience Today" }),
        /* @__PURE__ */ jsx("p", { className: "my-4", children: "Strategia accelerates your business growth through innovative solutions and cutting-edge technology. Join thousands of satisfied customers who have transformed their operations." }),
        /* @__PURE__ */ jsxs("div", { className: "features d-flex mb-4 flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "feature-item", children: [
            /* @__PURE__ */ jsx("i", { className: "bi bi-check-circle-fill" }),
            /* @__PURE__ */ jsx("span", { children: "Premium Support" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "feature-item", children: [
            /* @__PURE__ */ jsx("i", { className: "bi bi-check-circle-fill" }),
            /* @__PURE__ */ jsx("span", { children: "Cloud Integration" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "feature-item", children: [
            /* @__PURE__ */ jsx("i", { className: "bi bi-check-circle-fill" }),
            /* @__PURE__ */ jsx("span", { children: "Real-time Analytics" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "cta-buttons d-flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "btn btn-primary", children: "Start Free Trial" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "btn btn-outline", children: "Learn More" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "content-right position-relative", "data-aos": "fade-left", "data-aos-delay": "300", children: [
        /* @__PURE__ */ jsx("img", { src: "/assets/img/misc/misc-1.webp", alt: "Digital Platform", className: "img-fluid rounded-4" }),
        /* @__PURE__ */ jsxs("div", { className: "floating-card", children: [
          /* @__PURE__ */ jsx("div", { className: "card-icon", children: /* @__PURE__ */ jsx("i", { className: "bi bi-graph-up-arrow" }) }),
          /* @__PURE__ */ jsxs("div", { className: "card-content", children: [
            /* @__PURE__ */ jsx("span", { className: "stats-number", children: "245%" }),
            /* @__PURE__ */ jsx("span", { className: "stats-text", children: "Growth Rate" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "decoration", children: [
        /* @__PURE__ */ jsx("div", { className: "circle-1" }),
        /* @__PURE__ */ jsx("div", { className: "circle-2" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { id: "latest-posts", className: "latest-posts section", children: [
      /* @__PURE__ */ jsxs("div", { className: "section-title container", "data-aos": "fade-up", children: [
        /* @__PURE__ */ jsx("h2", { children: "Latest Posts" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Check Our" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "description-title", children: "Latest Posts" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "container", "data-aos": "fade-up", "data-aos-delay": "100", children: /* @__PURE__ */ jsx("div", { className: "row gy-4", children: /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("article", { children: [
        /* @__PURE__ */ jsx("div", { className: "post-img", children: /* @__PURE__ */ jsx("img", { src: "/assets/img/blog/blog-post-1.webp", alt: "", className: "img-fluid" }) }),
        /* @__PURE__ */ jsx("p", { className: "post-category", children: "Politics" }),
        /* @__PURE__ */ jsx("h2", { className: "title", children: /* @__PURE__ */ jsx("a", { href: "blog-details.html", children: "Dolorum optio tempore voluptas dignissimos" }) }),
        /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/assets/img/person/person-f-12.webp", alt: "", className: "img-fluid post-author-img flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "post-meta", children: [
            /* @__PURE__ */ jsx("p", { className: "post-author", children: "Maria Doe" }),
            /* @__PURE__ */ jsx("p", { className: "post-date", children: /* @__PURE__ */ jsx("time", { dateTime: "2022-01-01", children: "Jan 1, 2022" }) })
          ] })
        ] })
      ] }) }) }) })
    ] })
  ] });
}
function Welcome() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1e3);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { id: "preloader", className: "d-flex align-items-center justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Loading..." }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "index-page", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "main", children: /* @__PURE__ */ jsx(MainContent, {}) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Welcome as default
};
