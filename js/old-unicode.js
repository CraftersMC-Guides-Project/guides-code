// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

function toggleContent(element) {
    const content = element.closest(".container").querySelector(".content");
    if (content) {
        content.classList.toggle("active");
    }
}