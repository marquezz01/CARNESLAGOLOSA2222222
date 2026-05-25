/**
 * Maneja los eventos de clic de la página de forma centralizada usando delegación de eventos.
 * Este enfoque mejora el rendimiento y la mantenibilidad, especialmente en páginas complejas
 * o con contenido dinámico.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        const whatsappButton = event.target.closest('.js-whatsapp-btn');
        const contactButton = event.target.closest('.js-contact-btn');

        // Redirigir todas las acciones de WhatsApp y cotización a la página de contacto interna
        // para evitar el uso de números de teléfono específicos en el código.
        if (whatsappButton || contactButton) {
            window.location.href = 'contacto.html';
        }
    });

    // === MOBILE MENU TOGGLE ===
    const mobileMenuToggle = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('header nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll'); // Previene el scroll del body cuando el menú está abierto
        });

        // Cierra el menú cuando se hace clic en un enlace (para UX)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // === INTERSECTION OBSERVER FOR ANIMATIONS ===
    // Anima elementos cuando entran en el viewport.
    const animatedGrids = document.querySelectorAll('.catalog-main-layout, .features-grid'); // Selector actualizado

    const gridObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Animar solo una vez
            }
        });
    }, {
        threshold: 0.1 // El elemento debe ser visible en un 10% para activar
    });

    animatedGrids.forEach(element => {
        gridObserver.observe(element);
    });

    // === CATALOG IMAGE SWAP ON CLICK ===
    // Al hacer clic en una miniatura, esta se muestra en el recuadro grande.
    const catalogMain = document.querySelector('.catalog-main-layout');
    if (catalogMain) {
        const mainImg = catalogMain.querySelector('.main-catalog-image img');
        const thumbnails = catalogMain.querySelectorAll('.catalog-thumb-grid img');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Actualizar fuente y texto alternativo de la imagen principal
                mainImg.src = thumb.src;
                mainImg.alt = thumb.alt;
                
                // Efecto visual suave de entrada al cambiar
                mainImg.style.animation = 'none';
                void mainImg.offsetWidth; // Truco para reiniciar la animación
                mainImg.style.animation = 'fadeInUp 0.4s ease-out';
            });
        });
    }

    // === LIGHTBOX LOGIC ===
    // Permite ampliar la imagen principal del catálogo al hacer clic.
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        const mainImageContainer = document.querySelector('.main-catalog-image');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = lightbox.querySelector('.lightbox-close');

        if (mainImageContainer && lightboxImg && closeBtn) {
            mainImageContainer.addEventListener('click', () => {
                const mainImageEl = mainImageContainer.querySelector('img');
                lightbox.classList.add('active');
                lightboxImg.src = mainImageEl.src;
            });

            const closeLightbox = () => lightbox.classList.remove('active');

            closeBtn.addEventListener('click', closeLightbox);
            // Cierra el lightbox si se hace clic en el fondo (overlay)
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });

            // Cierra el lightbox al presionar la tecla "Escape"
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    closeLightbox();
                }
            });
        }
    }

    // === CAROUSEL LOGIC ===
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    if (track && slides.length > 0) {
        let currentIndex = 0;
        let slidesPerView = 1;
        const gap = 20; // Debe coincidir con el gap del CSS
        let autoPlayInterval;

        // Determina cuántos slides se ven según el ancho de pantalla
        const updateSlidesPerView = () => {
            if (window.innerWidth >= 1024) slidesPerView = 3;
            else if (window.innerWidth >= 768) slidesPerView = 2;
            else slidesPerView = 1;
            
            // Ajustar índice si cambia el tamaño para evitar espacios vacíos
            const maxIndex = slides.length - slidesPerView;
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            updateCarousel();
        };

        const updateCarousel = () => {
            const slideWidth = slides[0].offsetWidth + gap;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        };

        const nextSlide = () => {
            const maxIndex = slides.length - slidesPerView;
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop al inicio
            }
            updateCarousel();
        };

        const prevSlide = () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - slidesPerView; // Loop al final
            }
            updateCarousel();
        };

        // Auto-play silencioso
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, 4500);
        };

        const stopAutoPlay = () => clearInterval(autoPlayInterval);

        // Event Listeners
        nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
        prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
        
        // Pausar en hover
        track.parentElement.addEventListener('mouseenter', stopAutoPlay);
        track.parentElement.addEventListener('mouseleave', startAutoPlay);
        
        // Responsive
        window.addEventListener('resize', updateSlidesPerView);

        // Inicialización
        updateSlidesPerView();
        startAutoPlay();
    }

    // === ADVANCED PARALLAX FOR BANNER TEXT ===
    const catalogHeader = document.querySelector('.catalog-header');
    if (catalogHeader) {
        const title = catalogHeader.querySelector('h2');
        const divider = catalogHeader.querySelector('.gold-divider');
        const description = catalogHeader.querySelector('p');
        const container = catalogHeader.querySelector('.container');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            // Solo procesamos la animación cuando el banner es visible
            if (scrollY < 800) {
                requestAnimationFrame(() => {
                    // Sincronizamos los multiplicadores para que los elementos se muevan juntos
                    // Esto evita que el párrafo se separe demasiado del título al hacer scroll
                    const movement = scrollY * 0.15; 
                    if (title) title.style.transform = `translateY(${movement}px)`;
                    if (divider) divider.style.transform = `translateY(${movement}px)`;
                    if (description) description.style.transform = `translateY(${movement}px)`;
                    // Desvanecimiento suave al subir
                    if (container) container.style.opacity = Math.max(0, 1 - (scrollY / 600));
                });
            }
        }, { passive: true });
    }

    // === PREMIUM CATALOG LOGIC ===
    const productData = {
        jamon: {
            title: "Jamón Serrano Selección Especial",
            desc: "Nuestro jamón premium es curado artesanalmente por 12 meses, logrando un sabor profundo y una textura que se deshace en el paladar.",
            weight: "Empaque al vacío de 250g / 500g",
            ingredients: "Pierna de cerdo seleccionada, sal marina, especias naturales, sin conservantes artificiales.",
            img: "https://images.unsplash.com/photo-1544073420-5616335133d1?auto=format&fit=crop&q=80&w=800",
            nutrition: { cal: "240 kcal", prot: "28g", fat: "12g" }
        },
        tocino: {
            title: "Tocino Ahumado en Madera de Roble",
            desc: "Cortes gruesos de panceta seleccionada, ahumados lentamente para obtener ese aroma inconfundible y el equilibrio perfecto entre carne y grasa.",
            weight: "Bloque de 500g / Tajado 400g",
            ingredients: "Panceta de cerdo, humo natural de roble, sal, pimienta negra, azúcar morena.",
            img: "https://images.unsplash.com/photo-1606850246452-075b4f77656f?auto=format&fit=crop&q=80&w=800",
            nutrition: { cal: "450 kcal", prot: "15g", fat: "42g" }
        },
        salchicha: {
            title: "Salchichas Alemanas de Autor",
            desc: "Elaboradas siguiendo recetas tradicionales europeas con carnes frescas de primera y una mezcla secreta de hierbas aromáticas.",
            weight: "Paquete x 5 unidades (450g)",
            ingredients: "Carne de res y cerdo premium, tripa natural, nuez moscada, orégano, sal, ajo.",
            img: "https://images.unsplash.com/photo-1541048612927-7831e08c1fb1?auto=format&fit=crop&q=80&w=800",
            nutrition: { cal: "310 kcal", prot: "18g", fat: "24g" }
        }
    };

    const catalogCategories = document.querySelectorAll('.catalog-category');
    const modal = document.getElementById('product-details-modal');

    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
    }

    catalogCategories.forEach(category => {
        category.addEventListener('click', () => {
            const productId = category.getAttribute('data-product');
            const data = productData[productId];
            
            if (data) {
                openProductModal(data);
            }
        });

        category.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                category.click();
            }
        });
    });

    function openProductModal(data) {
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-description').textContent = data.desc;
        document.getElementById('modal-weight').textContent = data.weight;
        document.getElementById('modal-ingredients').textContent = data.ingredients;
        document.getElementById('modal-img-element').src = data.img;
        document.getElementById('nutri-cal').textContent = data.nutrition.cal;
        document.getElementById('nutri-prot').textContent = data.nutrition.prot;
        document.getElementById('nutri-fat').textContent = data.nutrition.fat;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
        document.body.style.overflow = 'hidden'; // Evita scroll
    }

    // Función global para cerrar el modal (usada en el HTML)
    window.closeProductModal = function() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
});