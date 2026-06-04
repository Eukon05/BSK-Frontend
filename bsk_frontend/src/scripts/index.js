let globalMode = 'text';
let dotsInterval = null;

function startDotsAnimation() {
    const loaderText = document.getElementById("loaderText");
    loaderText.style.display = "block";
    let dots = 0;
    dotsInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        loaderText.textContent = "Thinking" + ".".repeat(dots);
    }, 400);
}

function stopDotsAnimation() {
    clearInterval(dotsInterval);
    dotsInterval = null;
    const loaderText = document.getElementById("loaderText");
    loaderText.style.display = "none";
    loaderText.textContent = "Thinking";
}

function submit() {
    let resultText = document.getElementById("resultText");
    let prob = document.getElementById("probability");
    let fragm = document.getElementById("fragments");
    let loader = document.getElementById("loader");

    loader.style.display = "block";
    startDotsAnimation();
    resultText.textContent = "";
    prob.textContent = "";
    fragm.innerHTML = "";

    let fetchArgs = {};

    if (globalMode === 'file') {
        const fileInput = document.getElementById("fileToPredict");
        const file = fileInput?.files?.[0];

        if (!file) {
            resultText.className = "phishing";
            resultText.textContent = "Please select a file first";
            loader.style.display = "none";
            stopDotsAnimation();
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetchArgs = {
            method: "POST",
            body: formData
        };
    } else {
        const input = document.getElementById("inputArea").value;

        if (!input || input.trim().length < 10) {
            resultText.className = "phishing";
            resultText.textContent = "Input must be at least 10 characters long";
            loader.style.display = "none";
            stopDotsAnimation();
            return;
        }

        fetchArgs = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: input })
        };
    }

    fetch("http://127.0.0.1:5000/predict", fetchArgs)
        .then(response => {
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return response.json();
        })
        .then(jsobject => jsobject.result)
        .then(prediction => {
            resultText.className = prediction.decision.toLowerCase();
            resultText.textContent = prediction.decision;
            prob.textContent = JSON.stringify(prediction.phishing_chance).substring(0, 5) + '%';

            if (prediction.decision === "PHISHING") {
                fragm.innerHTML = "";
                prediction.suspicious_words.forEach(element => {
                    let insert = document.createElement("li");
                    let fragmentText = document.createElement("span");
                    let fragmentScore = document.createElement("span");

                    fragmentText.textContent = element[0];
                    fragmentScore.textContent = (JSON.stringify(element[1]) * 100).toString().substring(0, 4) + "%";
                    fragmentText.style.paddingRight = "10px";
                    fragmentScore.style.float = "right";

                    insert.appendChild(fragmentText);
                    insert.appendChild(fragmentScore);
                    fragm.appendChild(insert);
                });
            }
            loader.style.display = "none";
            stopDotsAnimation();
        })
        .catch(error => {
            console.error(error);
            resultText.className = "phishing";
            resultText.textContent = "Request failed";
            loader.style.display = "none";
            stopDotsAnimation();
        });
}

function switchMode(mode) {
    const textArea = document.getElementById('inputArea');
    const fileArea = document.getElementById('fileArea');
    const btnText = document.getElementById('btnText');
    const btnFile = document.getElementById('btnFile');

    globalMode = mode;

    if (mode === 'text') {
        textArea.style.display = 'block';
        fileArea.style.display = 'none';
        btnText.classList.add('active');
        btnFile.classList.remove('active');
    } else {
        textArea.style.display = 'none';
        fileArea.style.display = 'flex';
        btnText.classList.remove('active');
        btnFile.classList.add('active');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submitButton")?.addEventListener("click", submit);
    document.getElementById("btnText")?.addEventListener("click", () => switchMode('text'));
    document.getElementById("btnFile")?.addEventListener("click", () => switchMode('file'));
    document.getElementById("fileToPredict")?.addEventListener("change", (e) => {
        const label = document.getElementById("fileNameLabel");
        if (label) label.textContent = e.target.files?.[0]?.name || "No file chosen";
    });
});