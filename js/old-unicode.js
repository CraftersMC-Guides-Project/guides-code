// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

document.addEventListener("DOMContentLoaded", function () {
    const collapsibles = document.querySelectorAll(".collapsible");
    
    collapsibles.forEach((coll) => {
        coll.addEventListener("click", function () {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content) {
                content.classList.toggle("open");
            }
        });
    });
});