import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
const ImageUpload = ({ onImageSelected }) => {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageTitle, setImageTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    console.log("file", file);
    console.log("image", image);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === "string") {
          setImage(ev.target.result);
          setImageTitle(file.name);
          if (onImageSelected) {
            onImageSelected(file, ev.target.result);
            console.log("onImageSelected", JSON.stringify(onImageSelected(file, ev.target.result)));
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      removeUpload();
    }
  };
  const removeUpload = () => {
    setImage(null);
    setImageTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onImageSelected) onImageSelected(null, null);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === "string") {
          setImage(ev.target.result);
          setImageTitle(file.name);
          if (onImageSelected) onImageSelected(file, ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "file-upload", children: [
    /* @__PURE__ */ jsx("button", { className: "file-upload-btn", type: "button", onClick: handleButtonClick, children: "Add Image" }),
    !image ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: `image-upload-wrap${dragActive ? "image-dropping" : ""}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
          /* @__PURE__ */ jsx("input", { className: "file-upload-input", type: "file", ref: fileInputRef, accept: "image/*", onChange: handleFileChange }),
          /* @__PURE__ */ jsx("div", { className: "drag-text", children: /* @__PURE__ */ jsx("h3", { children: "Drag and drop a file or select add Image" }) })
        ]
      }
    ) : /* @__PURE__ */ jsxs("div", { className: "file-upload-content", children: [
      /* @__PURE__ */ jsx("img", { className: "file-upload-image", src: image, alt: "your upload" }),
      /* @__PURE__ */ jsx("div", { className: "image-title-wrap", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: removeUpload, className: "remove-image", children: [
        "Remove ",
        /* @__PURE__ */ jsx("span", { className: "image-title", children: imageTitle })
      ] }) })
    ] })
  ] });
};
const LoaderBook = () => {
  return /* @__PURE__ */ jsxs("div", { className: "loader-bg", children: [
    /* @__PURE__ */ jsxs("div", { className: "loader book", children: [
      /* @__PURE__ */ jsx("figure", { className: "page" }),
      /* @__PURE__ */ jsx("figure", { className: "page" }),
      /* @__PURE__ */ jsx("figure", { className: "page" })
    ] }),
    /* @__PURE__ */ jsx("h1", { children: "Reading" })
  ] });
};
const styles = {
  "categoria-wrapper": "_categoria-wrapper_hm3we_1",
  "categoria-label": "_categoria-label_hm3we_9",
  "categoria-select": "_categoria-select_hm3we_16",
  "categoria-input": "_categoria-input_hm3we_35"
};
const DevocionalesAgregar = () => {
  const editorRef = useRef(null);
  const [imagenUrl, setImagenUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [useNuevaCategoria, setUseNuevaCategoria] = useState(false);
  const showLoader = isLoading || isSubmitting;
  useEffect(() => {
    axios.get("/devocionales-search").then((res) => {
      console.log("res:: ", JSON.stringify(res.data));
      const cats = res.data.categorias.map((c) => c.categoria);
      console.log("cats", cats);
      setCategorias(cats);
    });
  }, []);
  const handleEditorInit = (_evt, editor) => {
    editorRef.current = editor;
    setIsLoading(false);
  };
  const handleImageChange = async (file) => {
    var _a, _b;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setIsSubmitting(true);
      console.log("formData", formData.get("file"));
      try {
        const response = await axios.post("/upload-image", formData, {
          headers: {
            "X-CSRF-TOKEN": ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.getAttribute("content")) || ""
          }
        });
        console.log("Respuesta backend:", response.data);
        setImagenUrl(response.data.location || response.data.url);
      } catch (error) {
        alert("Error al subir la imagen");
        if (error && typeof error === "object" && "response" in error) {
          console.error("Error al subir la imagen:", ((_b = error.response) == null ? void 0 : _b.data) || error.message);
        } else {
          console.error("Error al subir la imagen:", error);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setImagenUrl("");
    }
  };
  const handleGuardar = async () => {
    var _a;
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setIsSubmitting(true);
      try {
        await axios.post(
          "/devocionalesadd",
          { contenido: content, imagen: imagenUrl, categoria: useNuevaCategoria ? nuevaCategoria : categoria },
          {
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-TOKEN": ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.getAttribute("content")) || ""
            }
          }
        );
        alert("Devocional agregado correctamente");
        window.location.href = "/dashboard";
      } catch (error) {
        alert("Hubo un error al guardar el devocional");
        if (typeof error === "object" && error !== null && "response" in error && error.response && error.response.data && error.response.data.errors) {
          console.error("Errores de validación:", error.response.data.errors);
        } else {
          console.error("Error al guardar el devocional:", error);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Editor no encontrado");
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", minHeight: 400 }, children: [
    showLoader && /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ jsx(LoaderBook, {})
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "aggregar-devocionales", style: { pointerEvents: showLoader ? "none" : "auto", opacity: showLoader ? 0.5 : 1 }, children: [
      /* @__PURE__ */ jsx(ImageUpload, { onImageSelected: handleImageChange }),
      /* @__PURE__ */ jsx("button", { className: "btn-guardar", onClick: handleGuardar, disabled: showLoader, children: "Guardar" }),
      /* @__PURE__ */ jsxs("div", { className: styles["categoria-wrapper"], children: [
        /* @__PURE__ */ jsx("label", { className: styles["categoria-label"], children: "Categoría:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: styles["categoria-select"],
            value: useNuevaCategoria ? "nueva" : categoria,
            onChange: (e) => {
              if (e.target.value === "nueva") {
                setUseNuevaCategoria(true);
                setCategoria("");
              } else {
                setUseNuevaCategoria(false);
                setCategoria(e.target.value);
              }
            },
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona una categoría" }),
              categorias.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat)),
              /* @__PURE__ */ jsx("option", { value: "nueva", children: "Agregar nueva categoría..." })
            ]
          }
        ),
        useNuevaCategoria && /* @__PURE__ */ jsx(
          "input",
          {
            className: styles["categoria-input"],
            type: "text",
            placeholder: "Nueva categoría",
            value: nuevaCategoria,
            onChange: (e) => setNuevaCategoria(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Editor,
        {
          apiKey: "pc7pp06765v04kvyv0e65n2ja3v0c3hn5law9o9vpchu0erd",
          onInit: handleEditorInit,
          initialValue: "<p>This is the initial content of the editor.</p>",
          init: {
            height: "100%",
            width: "100%",
            menubar: true,
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "help",
              "wordcount"
            ],
            toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | image",
            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            automatic_uploads: true
          }
        }
      )
    ] })
  ] });
};
export {
  DevocionalesAgregar as default
};
