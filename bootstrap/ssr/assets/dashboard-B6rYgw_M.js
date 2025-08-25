import { jsx, Fragment, jsxs } from "react/jsx-runtime";
/* empty css              */
import { useId } from "react";
import { A as AppLayout } from "./app-layout-DfCIJ6Z1.js";
import { Head } from "@inertiajs/react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "./app-logo-icon-CoogQ1E6.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-avatar";
const Devocionales = ({ className }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx("div", { className: "blog-hero", "data-aos": "fade-up", "data-aos-delay": "100", style: { width: "100%", height: "100%", padding: "0" }, children: /* @__PURE__ */ jsxs("article", { className: "blog-item featured", "data-aos": "fade-up", children: [
    /* @__PURE__ */ jsx("img", { src: "/assets/img/blog/Devocionales.jpg", alt: "Blog Image", className: "img-fluid" }),
    /* @__PURE__ */ jsxs("div", { className: "blog-content", children: [
      /* @__PURE__ */ jsx("div", { className: "post-meta", children: /* @__PURE__ */ jsx("span", { className: "date", children: (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) }) }),
      /* @__PURE__ */ jsx("span", { className: "post-meta", children: /* @__PURE__ */ jsx("a", { href: "/devocionalesAgregar", title: "Devocionales - Daily Inspirations", children: "Agregar Devocionales" }) })
    ] })
  ] }) }) }) });
};
function PlaceholderPattern({ className }) {
  const patternId = useId();
  return /* @__PURE__ */ jsxs("svg", { className, fill: "none", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", { id: patternId, x: "0", y: "0", width: "10", height: "10", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M-3 13 15-5M-5 5l18-18M-1 21 17 3" }) }) }),
    /* @__PURE__ */ jsx("rect", { stroke: "none", fill: `url(#${patternId})`, width: "100%", height: "100%" })
  ] });
}
const breadcrumbs = [
  {
    title: "Dashboard",
    href: "/dashboard"
  }
];
function Dashboard() {
  return /* @__PURE__ */ jsxs(AppLayout, { breadcrumbs, children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid auto-rows-min gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border", children: [
          /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" }),
          /* @__PURE__ */ jsx(Devocionales, { className: "absolute inset-0 size-full" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border", children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" }) }),
        /* @__PURE__ */ jsx("div", { className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border", children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border", children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" }) })
    ] })
  ] });
}
export {
  Dashboard as default
};
