document.addEventListener('DOMContentLoaded', () => {
    const outputText = document.getElementById("outputText");
    const fileInput = document.getElementById("fileInput");
    let speechSynthesisInstance = null;

    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = function(e) {
                outputText.value = e.target.result;
            };
            reader.readAsText(file);
        } else if (file.type === "application/pdf") {
            extractTextFromPDF(file);
        } else {
            alert("Please upload a valid text or PDF file.");
        }
    });

    function extractTextFromPDF(file) {
        const reader = new FileReader();
        reader.onload = function() {
            const typedArray = new Uint8Array(reader.result);
            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
                let text = "";
                let promises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    promises.push(
                        pdf.getPage(i).then(page =>
                            page.getTextContent().then(content => {
                                text += content.items.map(item => item.str).join(" ") + "\n";
                            })
                        )
                    );
                }
                Promise.all(promises).then(() => outputText.value = text);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    window.textToSpeech = function() {
        const text = outputText.value;
        if (text) {
            speechSynthesisInstance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speechSynthesisInstance);
        } else {
            alert("Enter or upload text first!");
        }
    }

    window.pauseSpeech = function() {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    }

    window.resumeSpeech = function() {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }

    window.startSpeechToText = function() {
        const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = function(event) {
            outputText.value += event.results[0][0].transcript + " ";
        };

        recognition.onerror = function(event) {
            alert("Error in recognition: " + event.error);
        };
    }
});