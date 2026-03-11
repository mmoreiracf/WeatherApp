const botao = document.getElementById("searchButton");
const input = document.getElementById("cityInput");

const elementoCidade = document.getElementById("city-name");
const elementoTemperatura = document.getElementById("temperatura");
const elementoDescricao = document.getElementById("descricao");
const elementoSensacao = document.getElementById("sensacao-value");
const elementoUmidade = document.getElementById("umidade-value");
const elementoVento = document.getElementById("vento-value");
const elementoPrevisao = document.getElementById("forecast-container");

botao.addEventListener("click", () => {
    const cidade = input.value;
    if (cidade) {
        buscarClima(cidade);
    }
});

async function buscarClima(cidade) {
    const apiKey = '857234ebb7ec412b869dae6f45ec5fe5';
    // Endpoint para o clima atual
    const urlAtual = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    // Endpoint para a previsão de 5 dias (a cada 3 horas)
    const urlPrevisao = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        // --- 1. Busca Clima Atual ---
        const respostaAtual = await fetch(urlAtual);
        const dadosAtual = await respostaAtual.json();

        if (dadosAtual.cod !== 200) {
            alert(dadosAtual.message || "Cidade não encontrada!");
            return;
        }

        console.log("Clima Atual:", dadosAtual);

        elementoCidade.innerText = dadosAtual.name;
        elementoTemperatura.innerText = Math.round(dadosAtual.main.temp) + "°C";
        elementoDescricao.innerText = dadosAtual.weather[0].description;
        elementoSensacao.innerText = Math.round(dadosAtual.main.feels_like) + "°C";
        elementoUmidade.innerText = dadosAtual.main.humidity + "%";
        elementoVento.innerText = Math.round(dadosAtual.wind.speed * 3.6) + " km/h"; // Convertendo m/s para km/h

        const Idicone = dadosAtual.weather[0].icon;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${Idicone}@2x.png`;

        // --- 2. Busca Previsão da Semana ---
        const respostaPrevisao = await fetch(urlPrevisao);
        const dadosPrevisao = await respostaPrevisao.json();

        console.log("Previsão Completa (5 dias):", dadosPrevisao);
        atualizarPrevisao(dadosPrevisao.list);

    } catch (erro) {
        console.error("Deu erro na busca:", erro);
        alert("Erro na comunicação com a API.");
    }
}

function atualizarPrevisao(listaPrevisao) {
    // Limpa o contêiner de previsão anterior
    elementoPrevisao.innerHTML = "";

    const diasProcessados = new Set();

    // Itera pela lista que tem 40 itens (5 dias x 8 intervalos de 3h)
    for (const item of listaPrevisao) {
        const data = new Date(item.dt * 1000);
        // Pega abreviação do dia, ex: "seg", "ter"
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        // Vamos pegar preferencialmente a previsão do meio do dia ("12:00:00") para representar o dia como um todo
        // Mas se não tiver "12:00:00" ainda pra hoje, pega qualquer um desde que o dia não tenha sido inserido.
        if (!diasProcessados.has(diaSemana) && item.dt_txt.includes("12:00:00")) {
            diasProcessados.add(diaSemana);
            criarElementoPrevisao(diaSemana, item);
        }
    }

    // Fallback: se depois do loop ainda ficaram dias de fora porque não tinha "12:00:00" (ex: fim do 5º dia),
    // podemos passar novamente pegando o primeiro item de cada dia restante.
    if (diasProcessados.size < 5) {
        for (const item of listaPrevisao) {
            const data = new Date(item.dt * 1000);
            const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            if (!diasProcessados.has(diaSemana)) {
                diasProcessados.add(diaSemana);
                criarElementoPrevisao(diaSemana, item);
            }
        }
    }
}

function criarElementoPrevisao(diaSemana, item) {
    const divItem = document.createElement("div");
    divItem.classList.add("forecast-item");

    // Dia (ex: "Seg")
    const spanDay = document.createElement("span");
    spanDay.classList.add("day");
    spanDay.innerText = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    // Ícone
    const imgIcon = document.createElement("img");
    imgIcon.classList.add("icon");
    imgIcon.src = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    imgIcon.alt = item.weather[0].description;
    imgIcon.style.width = "40px";
    imgIcon.style.height = "40px";
    imgIcon.style.objectFit = "contain";

    // Temperatura
    const spanTemp = document.createElement("span");
    spanTemp.classList.add("temp");
    spanTemp.innerText = Math.round(item.main.temp) + "°";

    // Adiciona ao card
    divItem.appendChild(spanDay);
    divItem.appendChild(imgIcon);
    divItem.appendChild(spanTemp);

    // Adiciona o card ao container no HTML
    elementoPrevisao.appendChild(divItem);
}
