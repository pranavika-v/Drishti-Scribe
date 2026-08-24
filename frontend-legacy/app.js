const API_URL = "http://127.0.0.1:8000";


// --------------------------------------------------
// State
// --------------------------------------------------

let documentAnalysis = null;

let currentPageIndex = 0;

let currentElementIndex = 0;


// --------------------------------------------------
// DOM elements
// --------------------------------------------------

const pdfInput =
    document.getElementById("pdfInput");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const status =
    document.getElementById("status");

const reader =
    document.getElementById("reader");

const documentTitle =
    document.getElementById("documentTitle");

const pageIndicator =
    document.getElementById("pageIndicator");

const elementType =
    document.getElementById("elementType");

const elementTitle =
    document.getElementById("elementTitle");

const elementDescription =
    document.getElementById("elementDescription");

const structureList =
    document.getElementById("structureList");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const readBtn =
    document.getElementById("readBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resumeBtn =
    document.getElementById("resumeBtn");

const stopBtn =
    document.getElementById("stopBtn");


// --------------------------------------------------
// Upload PDF
// --------------------------------------------------

analyzeBtn.addEventListener(
    "click",
    analyzeDocument
);


async function analyzeDocument() {

    const file =
        pdfInput.files[0];


    if (!file) {

        status.textContent =
            "Please select a PDF first.";

        return;
    }


    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {

        status.textContent =
            "Please select a PDF file.";

        return;
    }


    status.textContent =
        "Analyzing document. Please wait...";


    analyzeBtn.disabled = true;


    try {

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );


        const response =
            await fetch(
                `${API_URL}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data =
            await response.json();


        if (data.error) {

            throw new Error(
                data.error
            );
        }


        documentAnalysis = {
            pages: data.pages
        };


        documentTitle.textContent =
            data.filename;


        currentPageIndex = 0;

        currentElementIndex = 0;


        renderReader();


        reader.classList.remove(
            "hidden"
        );


        status.textContent =
            "Document analyzed successfully.";


        speak(
            "Document analysis complete. " +
            "Use next and previous to navigate."
        );


    } catch (error) {

        console.error(error);

        status.textContent =
            `Error: ${error.message}`;


    } finally {

        analyzeBtn.disabled = false;

    }

}


// --------------------------------------------------
// Render current element
// --------------------------------------------------

function renderReader() {

    if (!documentAnalysis) {
        return;
    }


    const pages =
        documentAnalysis.pages || [];


    if (pages.length === 0) {

        elementType.textContent =
            "No content";

        elementTitle.textContent =
            "No elements found";

        elementDescription.textContent =
            "The document did not contain readable elements.";

        return;
    }


    const page =
        pages[currentPageIndex];


    const elements = page.elements || [];


    pageIndicator.textContent =
        `Page ${page.page} of ${pages.length}`;


    if (elements.length === 0) {

        elementType.textContent =
            "Empty page";

        elementTitle.textContent =
            "No meaningful elements";

        elementDescription.textContent =
            "No meaningful content was detected on this page.";

        return;
    }


    const element =
        elements[currentElementIndex];


    elementType.textContent =
        element.type || "Element";


    elementTitle.textContent =
        element.text || "Untitled";


    elementDescription.textContent =
        element.description ||
        "No description available.";


    renderStructure();


    updateButtons();

}


// --------------------------------------------------
// Render document structure
// --------------------------------------------------

function renderStructure() {

    structureList.innerHTML = "";


    const pages =
        documentAnalysis.pages || [];


    pages.forEach(
        (page, pageIndex) => {

            const pageHeader =
                document.createElement("div");

            pageHeader.textContent =
                `Page ${page.page}`;

            pageHeader.className =
                "structure-item";

            pageHeader.tabIndex = 0;


            pageHeader.addEventListener(
                "click",
                () => {

                    currentPageIndex =
                        pageIndex;

                    currentElementIndex =
                        0;

                    renderReader();

                    speakCurrentElement();

                }
            );


            structureList.appendChild(
                pageHeader
            );


            page.elements.forEach(
                (element, elementIndex) => {

                    const item =
                        document.createElement("div");


                    item.textContent =
                        `${element.type}: ${
                            element.text || "Untitled"
                        }`;


                    item.className =
                        "structure-item";


                    item.tabIndex = 0;


                    item.style.marginLeft =
                        "20px";


                    item.addEventListener(
                        "click",
                        () => {

                            currentPageIndex =
                                pageIndex;

                            currentElementIndex =
                                elementIndex;

                            renderReader();

                            speakCurrentElement();

                        }
                    );


                    structureList.appendChild(
                        item
                    );

                }
            );

        }
    );

}


// --------------------------------------------------
// Navigation
// --------------------------------------------------

nextBtn.addEventListener(
    "click",
    nextElement
);


previousBtn.addEventListener(
    "click",
    previousElement
);


function nextElement() {

    if (!documentAnalysis) {
        return;
    }


    const pages =
        documentAnalysis.pages;


    const currentPage =
        pages[currentPageIndex];


    const elements =
        currentPage.elements || [];


    if (
        currentElementIndex <
        elements.length - 1
    ) {

        currentElementIndex++;

    } else if (
        currentPageIndex <
        pages.length - 1
    ) {

        currentPageIndex++;

        currentElementIndex = 0;

    } else {

        speak(
            "You have reached the end of the document."
        );

        return;
    }


    renderReader();

    speakCurrentElement();

}


function previousElement() {

    if (!documentAnalysis) {
        return;
    }


    if (
        currentElementIndex > 0
    ) {

        currentElementIndex--;

    } else if (
        currentPageIndex > 0
    ) {

        currentPageIndex--;

        const previousPage =
            documentAnalysis.pages[
                currentPageIndex
            ];

        currentElementIndex =
            Math.max(
                previousPage.elements.length - 1,
                0
            );

    } else {

        speak(
            "You are at the beginning of the document."
        );

        return;
    }


    renderReader();

    speakCurrentElement();

}


function updateButtons() {
    const previousButton = document.getElementById("prevBtn");
    const nextButton = document.getElementById("nextBtn");

    if (!previousButton || !nextButton) {
        return;
    }

    const page = pages[currentPageIndex];
    const elements = page ? page.elements || [] : [];

    previousButton.disabled =
        currentPageIndex === 0 &&
        currentElementIndex === 0;

    nextButton.disabled =
        currentPageIndex === pages.length - 1 &&
        currentElementIndex >= elements.length - 1;
}

// --------------------------------------------------
// Speech
// --------------------------------------------------

function getCurrentSpeechText() {

    if (!documentAnalysis) {

        return "";
    }


    const page =
        documentAnalysis.pages[
            currentPageIndex
        ];


    if (!page) {
        return "";
    }


    const element =
        page.elements[
            currentElementIndex
        ];


    if (!element) {
        return "";
    }


    return [
        element.type,
        element.text,
        element.description
    ]
        .filter(Boolean)
        .join(". ");

}


function speakCurrentElement() {

    const text =
        getCurrentSpeechText();


    if (!text) {
        return;
    }


    speak(text);

}


function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Text-to-speech is not supported by this browser."
        );

        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate = 0.9;

    utterance.pitch = 1;

    utterance.volume = 1;


    window.speechSynthesis.speak(
        utterance
    );

}


// --------------------------------------------------
// Speech controls
// --------------------------------------------------

readBtn.addEventListener(
    "click",
    () => {

        speakCurrentElement();

    }
);


pauseBtn.addEventListener(
    "click",
    () => {

        if (
            window.speechSynthesis.speaking
        ) {

            window.speechSynthesis.pause();

        }

    }
);


resumeBtn.addEventListener(
    "click",
    () => {

        if (
            window.speechSynthesis.paused
        ) {

            window.speechSynthesis.resume();

        }

    }
);


stopBtn.addEventListener(
    "click",
    () => {

        window.speechSynthesis.cancel();

    }
);


// --------------------------------------------------
// Keyboard accessibility
// --------------------------------------------------

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * Don't intercept keyboard input
         * when the user is typing/selecting a file.
         */

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {

            return;
        }


        switch (event.key) {

            case "ArrowRight":

            case "ArrowDown":

                event.preventDefault();

                nextElement();

                break;


            case "ArrowLeft":

            case "ArrowUp":

                event.preventDefault();

                previousElement();

                break;


            case " ":

                event.preventDefault();

                if (
                    window.speechSynthesis.speaking &&
                    !window.speechSynthesis.paused
                ) {

                    window.speechSynthesis.pause();

                } else {

                    speakCurrentElement();

                }

                break;


            case "Escape":

                window.speechSynthesis.cancel();

                break;

        }

    }
);


// --------------------------------------------------
// Initial focus
// --------------------------------------------------

reader.addEventListener(
    "transitionend",
    () => {

        document
            .getElementById("currentElement")
            .focus();

    }
);