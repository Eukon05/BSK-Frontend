function submit() {
    let input = document.getElementById("inputArea").value;
    let resultText = document.getElementById("resultText");
    let prob = document.getElementById("probability");
    let fragm = document.getElementById("fragments")
    let loader = document.getElementById("loader");

    loader.style.display = "block";
    resultText.textContent = "";
    prob.textContent = "";
    fragm.innerHTML = "";

    if (!input || input.trim().length < 10) {
        resultText.className = "phishing";
        resultText.textContent = "Input must be at least 10 characters long";
        loader.style.display = "none";
        return;
    }

    fetch("/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: input })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(jsobject => jsobject.result)
        .then(prediction => {
            resultText.className = prediction.decision.toLowerCase();
            resultText.textContent = prediction.decision;
            prob.textContent = JSON.stringify(prediction.phishing_chance).substring(0, 5) + '%';

            if (prediction.decision === "PHISHING") {
                fragm.innerHTML = "";

                prediction.fragments.forEach(element => {
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
        })
        .catch(error => {
            console.error(error);
            resultText.className = "phishing";
            resultText.textContent = "Request failed";
            loader.style.display = "none";
        })
}

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");
    if (submitButton) {
        submitButton.addEventListener("click", submit);
    }
});