// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.addEventListener("click", function () {
            toggleContent(this);
        });
    });
});

function toggleContent(section) {
    const content = section.nextElementSibling;

    if (!content || !content.classList.contains("content")) return;
    document.querySelectorAll(".content").forEach(c => {
        if (c !== content) c.style.display = "none";
    });

    content.style.display = content.style.display === "block" ? "none" : "block";
}