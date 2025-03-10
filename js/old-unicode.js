// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

function toggleContent(element) {
    const section = element.parentElement;
    const content = section.querySelector(".content");

    if (content) {
        content.classList.toggle("active");
    }
}