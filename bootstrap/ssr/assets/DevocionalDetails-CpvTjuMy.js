import { jsx, jsxs } from "react/jsx-runtime";
import { u as useImagePreload } from "./devocionalDetails-D5k2N-jf.js";
import { useState, useEffect } from "react";
const DevocionalDetails = ({ devocional }) => {
  const [loading, setLoading] = useState(true);
  const imageLoaded = useImagePreload(devocional.imagen);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1e3);
  }, []);
  const getH1Text = (html) => {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return match ? match[1].trim() : "";
  };
  const splitH1Parts = (h1Text) => {
    const parts = h1Text.split(" ");
    return [parts[0] || "", parts[1] || "", parts.slice(2).join(" ") || ""];
  };
  const removeFirstTag = (html) => {
    return html.replace(/<h1[^>]*>.*?<\/h1>/i, "").trim();
  };
  const devocionalContent = removeFirstTag(devocional.contenido);
  const H1Custom = ({ contenido }) => {
    const h1Text = getH1Text(contenido);
    const [parte1, parte2, parte3] = splitH1Parts(h1Text);
    return /* @__PURE__ */ jsx(
      "header",
      {
        className: "header-modal",
        style: {
          background: `url(${devocional.imagen}) no-repeat`,
          backgroundSize: "cover",
          paddingTop: "61.93333333%",
          fontFamily: "'Sucrose Bold Two'",
          position: "relative",
          paddingBottom: "200px",
          color: "white",
          zIndex: -2
        },
        children: /* @__PURE__ */ jsxs("h1", { className: "title", style: { paddingTop: "50px" }, children: [
          parte1,
          /* @__PURE__ */ jsx("span", { children: parte2 }),
          parte3
        ] })
      }
    );
  };
  if (loading && !imageLoaded) {
    return /* @__PURE__ */ jsx("div", { id: "preloader", className: "d-flex align-items-center justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Loading..." }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "devocional-details", children: [
    /* @__PURE__ */ jsx(H1Custom, { contenido: devocional.contenido }),
    /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx("p", { style: { fontSize: "20px", padding: "10px" }, dangerouslySetInnerHTML: { __html: devocionalContent } }) }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: "8px", color: "#888" }, children: devocional.created_at ? new Date(devocional.created_at).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "" })
  ] });
};
export {
  DevocionalDetails as default
};
