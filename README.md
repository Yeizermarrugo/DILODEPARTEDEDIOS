
Este proyecto es una aplicación web para mostrar devocionales cristianos en formato blog. Permite visualizar los devocionales más recientes, navegar entre categorías, ver detalles de cada devocional y acceder a contenido destacado, últimas publicaciones y secciones de inspiración.

## Características principales

- **Listado de devocionales**: Muestra los últimos devocionales en un grid visual con imágenes y títulos extraídos dinámicamente.
- **Detalle de devocional**: Cada devocional tiene una página propia con imagen destacada, contenido enriquecido y fecha de publicación.
- **Navegación SPA**: La navegación entre devocionales y páginas se realiza de forma rápida usando React y Inertia.js.
- **Diseño responsivo y moderno**: Utiliza grid CSS y componentes visuales para una experiencia atractiva en desktop y móvil.
- **Carga dinámica**: Los devocionales se obtienen desde un backend Laravel, con actualización automática de la lista.
- **Secciones adicionales**: Incluye categorías, posts destacados, últimas publicaciones y llamados a la acción.

## Tecnologías utilizadas

- **Frontend:** React, Inertia.js, Vite, Bootstrap Icons, CSS Grid/Flexbox
- **Backend:** Laravel
- **Estilos:** CSS personalizado, fuentes web desde Bunny Fonts

## Estructura básica

- **MainContent.jsx**: Renderiza el grid de devocionales, posts destacados y secciones extra.
- **DevocionalDetails.jsx**: Muestra el detalle del devocional con manejo de imágenes y contenido HTML.
- **Rutas Inertia**: Navegación SPA para transiciones rápidas.
- **Estilos**: Archivos CSS para grid, cards, fuentes y adaptabilidad.

## Instalación y uso

1. Clona el repositorio:

    ```bash
    git clone https://github.com/tu_usuario/tu_repositorio.git
    ```

2. Instala dependencias:

    ```bash
    npm install
    composer install
    ```

3. Copia y configura tu archivo `.env` de Laravel.

4. Compila los assets:

    ```bash
    npm run dev
    ```

5. Ejecuta el backend Laravel:

    ```bash
    php artisan serve
    ```

6. Accede a la app en tu navegador:
    ```
    http://localhost:8000
    ```

## Personalización

- Puedes agregar nuevos devocionales desde el backend y estos aparecerán automáticamente en el frontend.
- Los estilos y layout pueden ser adaptados en los archivos CSS según tus preferencias.
- Las imágenes principales de cada devocional se muestran con esquinas redondeadas y adaptadas al grid.

## Contribuciones

¡Las contribuciones son bienvenidas!
Puedes enviar pull requests para mejorar la funcionalidad, corregir errores o proponer nuevas secciones.

## Licencia

Este proyecto está bajo la licencia MIT.

---

**Desarrollado para comunidades cristianas que buscan compartir inspiración y reflexión diaria de forma moderna y accesible.**
