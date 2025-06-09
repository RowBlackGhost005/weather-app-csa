const searchButton = document.getElementById("citySearchButton");

const weatherContainer = document.getElementById("weather");

const cityInput = document.getElementById("cityInput");

const cityNameTitle = document.getElementById("cityNameTitle");

const loading = document.getElementById("loader");
loading.style.display = "none";

searchButton.addEventListener("click" , function() {

    let city = cityInput.value;

    weatherContainer.replaceChildren();

    if(city === ""){
        alert("Please enter a city name");
        return;
    }
    
    showWeatherForecast(city);
});

function showWeatherForecast(city){
    
    loading.style.display = "block";

    cityNameTitle.innerText = "";

    getWeatherForecast(city).then(forecast => {
        const p = document.createElement("p");

        let day = 1;

        do {

            let min = 100;
            let max = 0;
            let avg = 0;
            let rainProbability = 0;

            for(let i = (day - 1) * 24 ; i < (day * 24) ; i++){

                let hourForecast = forecast[i];

                let temperature = hourForecast.temperature;

                let rainProb = hourForecast.precipitationProbability;

                rainProbability += rainProb;

                avg += temperature;

                if(temperature > max){
                    max = temperature;
                }

                if(temperature < min){
                    min = temperature;
                }
            }

            rainProbability = rainProbability / 24;

            avg = avg / 24;

            //p.innerText = `Minimum: ${min} Maximum: ${max} Average: ${avg} Rain Prob: ${rainProbability}`;

            const dateString = new Date(forecast[(day * 24) - 1].date);

            let weatherDay = {
                date : dateString.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric' , month: 'long'}),
                minTemp : min.toFixed(1),
                maxTemp : max.toFixed(1),
                avgTemp : avg.toFixed(1),
                rainProb : rainProbability.toFixed(1)
            };

            //weatherContainer.appendChild(p);

            //console.log(weatherDay);

            let weatherCard = createWeatherCard(weatherDay);

            weatherContainer.appendChild(weatherCard);

            day++;

        }while(day < 7)

        cityNameTitle.innerText = city + " forecast";
    })
    .catch(err => showError(err))
    .finally(() => loading.style.display = "none");

    
    
}

async function getWeatherForecast(city){

    let coordinates = await getCoordinates(city);

    let forecast = await getForecast(coordinates);

    let temperatures = forecast.hourly.temperature_2m;

    let date = forecast.hourly.time;

    let apparentTemperature = forecast.hourly.apparent_temperature;

    let precipitationProbability = forecast.hourly.precipitation_probability;

    let hourlyForecast = temperatures.map((value , index) => ({
            temperature: value , date: date[index] , apparentTemperature:  apparentTemperature[index] , precipitationProbability: precipitationProbability[index] 
        }));
    
    return hourlyForecast;
}

async function getCoordinates(city) {
    try{
        let response = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`);

        let data = await response.json();

        return [data[0].lat , data[0].lon];
    }catch(err){
        throw new Error("City not Found!");
    }

}

async function getForecast(coordinates){
    try{
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates[0]}&longitude=${coordinates[1]}&hourly=temperature_2m,precipitation_probability,apparent_temperature&timezone=auto`);

        let data = await response.json();

        return data;
    }catch(err){
        throw new Error("Error trying to fetch weather forecast");
    }

}

function createWeatherCard(weatherInfo){
    let divCard = document.createElement("div");
    divCard.classList.add("flex-column");
    divCard.classList.add("border-1");
    divCard.classList.add("grid-2");

    let divDate = document.createElement("div");
    divDate.classList.add("text-center");
    divDate.classList.add("border-b-1");
    divDate.classList.add("color-primary");
    divDate.classList.add("text-bold");
    divDate.classList.add("text-light");
    divDate.classList.add("py-1");

    let pDate = document.createElement("p");
    pDate.innerText = weatherInfo.date;

    let divAvgTemp = document.createElement("div");
    divAvgTemp.classList.add("text-center");
    divAvgTemp.classList.add("border-b-1");
    divAvgTemp.classList.add("avg-temp");
    divAvgTemp.classList.add("text-bold");
    divAvgTemp.classList.add("py-1");

    let pAvgTempTitle = document.createElement("p");
    pAvgTempTitle.innerText = "Average Temperature:"

    let pAvgTempValue = document.createElement("p");
    pAvgTempValue.innerText = weatherInfo.avgTemp + "°C";

    let divMinMaxTempContainer = document.createElement("div");
    divMinMaxTempContainer.classList.add("flex-row");
    divMinMaxTempContainer.classList.add("border-b-1");
    divMinMaxTempContainer.classList.add("tex-bold");

    let divMinTemp = document.createElement("div");
    divMinTemp.classList.add("text-center");
    divMinTemp.classList.add("min-temp");
    divMinTemp.classList.add("py-1");
    divMinTemp.classList.add("flex-stretch");
    
    let pMinTempTitle = document.createElement("p");
    pMinTempTitle.classList.add("text-bold");
    pMinTempTitle.innerText = "Minimum:"

    let pMinTempValue = document.createElement("p");
    pMinTempValue.innerText = weatherInfo.minTemp + "°C";

    let divMaxTemp = document.createElement("div");
    divMaxTemp.classList.add("text-center");
    divMaxTemp.classList.add("max-temp");
    divMaxTemp.classList.add("py-1");
    divMaxTemp.classList.add("flex-stretch");

    let pMaxTempTitle = document.createElement("p");
    pMaxTempTitle.classList.add("text-bold");
    pMaxTempTitle.innerText = "Maximum:"

    let pMaxTempValue = document.createElement("p");
    pMaxTempValue.innerText = weatherInfo.maxTemp + "°C";

    let divRainProbContainer = document.createElement("div");
    divRainProbContainer.classList.add("text-center");
    divRainProbContainer.classList.add("rain");
    divRainProbContainer.classList.add("text-bold");
    divRainProbContainer.classList.add("py-1");

    let pRainProbTitle = document.createElement("p");
    pRainProbTitle.innerText = "Rain Probability:"

    let pRainProbValue = document.createElement("p");
    pRainProbValue.innerText = weatherInfo.rainProb + "%";

    divDate.appendChild(pDate);

    divAvgTemp.appendChild(pAvgTempTitle);
    divAvgTemp.appendChild(pAvgTempValue);
    
    divMinTemp.appendChild(pMinTempTitle);
    divMinTemp.appendChild(pMinTempValue);

    divMaxTemp.appendChild(pMaxTempTitle);
    divMaxTemp.appendChild(pMaxTempValue);

    divMinMaxTempContainer.appendChild(divMinTemp);
    divMinMaxTempContainer.appendChild(divMaxTemp);

    divRainProbContainer.appendChild(pRainProbTitle);
    divRainProbContainer.appendChild(pRainProbValue);

    divCard.appendChild(divDate);
    divCard.appendChild(divAvgTemp);
    divCard.appendChild(divMinMaxTempContainer);
    divCard.appendChild(divRainProbContainer);

    weatherContainer.appendChild(divCard);

    return divCard;
}

function showError(message){
    alert(message);
}