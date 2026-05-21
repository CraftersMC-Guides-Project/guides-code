function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".guides-section");

    sections.forEach((section) => {
        const carousel = section.querySelector(".card-container");
        const cards = carousel ? Array.from(carousel.querySelectorAll(".card")) : [];
        const dotsContainer = section.querySelector(".guides-dots");

        if (!carousel || !cards.length || !dotsContainer) {
            return;
        }

        const carouselName = section.dataset.carouselName || "Carousel";
        let activeIndex = 0;
        let autoRotateTimer = null;
        let resumeTimer = null;
        const rotationDelay = 4500;

        const buildDots = () => {
            dotsContainer.innerHTML = "";

            cards.forEach((card, index) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "guide-dot";
                dot.setAttribute("aria-label", `Show ${carouselName} card ${index + 1}`);
                dot.addEventListener("click", () => {
                    stopAutoRotate();
                    scrollToCard(index);
                    scheduleAutoRotate();
                });
                dotsContainer.appendChild(dot);
            });
        };

        const getDots = () => Array.from(dotsContainer.querySelectorAll(".guide-dot"));

        const setActiveDot = (index) => {
            activeIndex = index;
            getDots().forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        const scrollToCard = (index) => {
            const card = cards[index];
            if (!card) return;
            const carouselRect = carousel.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const targetLeft = cardRect.left - carouselRect.left + carousel.scrollLeft;
            carousel.scrollTo({
                left: targetLeft,
                behavior: "smooth",
            });
            setActiveDot(index);
        };

        const updateActiveCard = () => {
            const carouselRect = carousel.getBoundingClientRect();
            const center = carouselRect.left + carouselRect.width / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;

            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(cardCenter - center);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== activeIndex) {
                setActiveDot(closestIndex);
            }
        };

        const advanceCard = () => {
            const nextIndex = (activeIndex + 1) % cards.length;
            scrollToCard(nextIndex);
        };

        const stopAutoRotate = () => {
            if (autoRotateTimer) {
                clearInterval(autoRotateTimer);
                autoRotateTimer = null;
            }
            if (resumeTimer) {
                clearTimeout(resumeTimer);
                resumeTimer = null;
            }
        };

        const scheduleAutoRotate = () => {
            stopAutoRotate();
            resumeTimer = setTimeout(() => {
                autoRotateTimer = setInterval(advanceCard, rotationDelay);
            }, 1500);
        };

        buildDots();
        setActiveDot(0);
        scrollToCard(0);
        scheduleAutoRotate();

        carousel.addEventListener("scroll", () => {
            window.requestAnimationFrame(updateActiveCard);
        });

        carousel.addEventListener("mouseenter", stopAutoRotate);
        carousel.addEventListener("mouseleave", scheduleAutoRotate);
        carousel.addEventListener("focusin", stopAutoRotate);
        carousel.addEventListener("focusout", scheduleAutoRotate);
        carousel.addEventListener("touchstart", stopAutoRotate, { passive: true });
        carousel.addEventListener("touchend", scheduleAutoRotate, { passive: true });
        window.addEventListener("resize", updateActiveCard);
    });
});
