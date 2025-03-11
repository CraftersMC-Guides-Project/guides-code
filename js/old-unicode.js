// function toggleContent(element) {
//     const content = element.nextElementSibling;
//     content.classList.toggle("active");
// }

// document.addEventListener("DOMContentLoaded", function () {
//     const sections = document.querySelectorAll(".section");

//     sections.forEach(section => {
//         section.addEventListener("click", function () {
//             toggleContent(this);
//         });
//     });
// });

// function toggleContent(section) {
//     const content = section.nextElementSibling;

//     if (!content || !content.classList.contains("content")) return;
//     document.querySelectorAll(".content").forEach(c => {
//         if (c !== content) c.style.display = "none";
//     });

//     content.style.display = content.style.display === "block" ? "none" : "block";
// }

// document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".content").forEach(c => c.style.display = "none");
// });

// function toggleContent(section) {
//     const content = section.nextElementSibling;

//     if (!content || !content.classList.contains("content")) return;

//     document.querySelectorAll(".content").forEach(c => {
//         if (c !== content) {
//             c.style.maxHeight = "0px";
//             c.style.padding = "0";
//             setTimeout(() => c.style.display = "none", 300);
//         }
//     });

//     if (content.style.display === "none" || content.style.maxHeight === "0px") {
//         content.style.display = "block";
//         setTimeout(() => {
//             content.style.maxHeight = "1200px";
//             content.style.padding = "10px";
//         }, 10);
//     } else {
//         content.style.maxHeight = "0px";
//         content.style.padding = "0";
//         setTimeout(() => content.style.display = "none", 300);
//     }
// }

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".content").forEach(c => {
        c.style.display = "none";
        c.style.maxHeight = "0px";
        c.style.overflow = "hidden";
        c.style.padding = "0";
    });
});

function toggleContent(section) {
    const content = section.querySelector(".content"); // Find child content

    if (!content) return;

    // Close all other sections
    document.querySelectorAll(".content").forEach(c => {
        if (c !== content) {
            c.style.maxHeight = "0px";
            c.style.padding = "0";
            setTimeout(() => c.style.display = "none", 300);
        }
    });

    // Toggle current section
    if (content.style.display === "none" || content.style.maxHeight === "0px") {
        content.style.display = "block";
        setTimeout(() => {
            content.style.maxHeight = "1200px";
            content.style.padding = "10px";
        }, 10);
    } else {
        content.style.maxHeight = "0px";
        content.style.padding = "0";
        setTimeout(() => content.style.display = "none", 300);
    }
}
