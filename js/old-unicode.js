// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

function toggleContent(element) {
    const content = element.nextElementSibling;

    if (content && content.classList.contains("content")) {
        content.classList.toggle("active");
    }
}