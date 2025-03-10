// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

document.addEventListener("DOMContentLoaded", () => {
    const collapsibles = document.querySelectorAll(".collapsible");

    collapsibles.forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("active");

            const content = this.nextElementSibling;
            if (content.classList.contains("open")) {
                content.classList.remove("open");
                content.style.maxHeight = null;
            } else {
                content.classList.add("open");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});