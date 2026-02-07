const Key="b543eee0d3955dce0e4d3bc862fe3f7f";


let countryCode=document.querySelector(".country");
let CityName=document.querySelector(".CityName");
let WeatherDescription=document.querySelectorAll(".Weather-condition");
let latitude=document.querySelector(".Lat");
let longitude=document.querySelector(".Lon");
let temp=document.querySelectorAll(".weather-tmp");
let highTemp=document.querySelector(".high-temp");
let lowTemp=document.querySelector(".low-temp");
let Img=document.querySelectorAll(".weather-img");

let dayEl=document.querySelector(".day");
let dateEl=document.querySelector(".date");
let timeEl=document.querySelector(".Time");


let Humidity=document.querySelector(".Humidity-value");
let Pressure=document.querySelector(".Pressure-value");
let Visibility=document.querySelector(".Visibility-value");
let windSpeed=document.querySelector(".Wind-value");
let sunriseTime=document.querySelector(".sunriseTime");
let sunsetTime=document.querySelector(".sunsetTime");
let lengthOfDay=document.querySelector(".dayLength");


let AQI=document.querySelector(".AQI-des");
let AQIValue=document.querySelector(".AQI-val");

let tempFeels=document.querySelector(".temp-feels");

let HourlyForecastWidth;


//By default when document is loaded
document.addEventListener("DOMContentLoaded", async () => {
    updateWeather("Lahore");

});


//when user searches
let searchBtn=document.querySelector(".search");
let searchedCity=document.querySelector(".searchedCity");
searchBtn.addEventListener("click",()=>{
    if(searchedCity.value==""){
        alert("Please Input a Valid City Name")
    }
    else{
        updateWeather(searchedCity.value);
    }
    
})


//when user click on btn to get current location
let GeoLocBtn=document.querySelector(".currentLocation");
let hasGeoLocation=false;



GeoLocBtn.addEventListener("click",()=>{
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const reportlat = position.coords.latitude;
        const reportlon = position.coords.longitude;

        hasGeoLocation=true;

        updateWeather("",reportlat,reportlon);


      },
      (error) => {
        console.error("Error getting location:", error.message);
        alert("Could not get your location. Please allow location access.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
})





//functions to perfom tasks

//Function to Format time
function formatWeatherTime(dt, timezone, locale = "en-US") {

  let localDate = new Date((dt + timezone) * 1000);

  let formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC" 
  });

  return formatter.formatToParts(localDate);
}

//Function to find time b/w sunrise and sunset

function getDayLength(sunrise, sunset) {
    let diff = sunset - sunrise;

    
    let hours = Math.floor(diff / 3600); 
    let minutes = Math.floor((diff % 3600) / 60);

    return `${hours}H : ${minutes}M`;
}

//displaying formatted time
function DisplayTime(dt,timeZone,sunrise,sunset){

    let parts= formatWeatherTime(dt,timeZone);
        
        
    let day = parts.find(p => p.type === "weekday").value;
    let date = parts.find(p => p.type === "day").value;
    let month = parts.find(p => p.type === "month").value;
    let year = parts.find(p => p.type === "year").value;
    let hour = parts.find(p => p.type === "hour").value;
    let minute = parts.find(p => p.type === "minute").value;
    let period = parts.find(p => p.type === "dayPeriod").value;

    dayEl.innerText=day;
    dateEl.innerText=date+" "+month+", "+year;
    timeEl.innerText=hour+":"+minute+" "+period;

    let sunriseParts = formatWeatherTime(sunrise, timeZone);
    let sunsetParts  = formatWeatherTime(sunset,timeZone);

    let sunriseHour   = sunriseParts.find(p => p.type === "hour").value;
    let sunriseMinute = sunriseParts.find(p => p.type === "minute").value;

    let sunsetHour   = sunsetParts.find(p => p.type === "hour").value;
    let sunsetMinute = sunsetParts.find(p => p.type === "minute").value;

    sunriseTime.innerText=sunriseHour+" : "+sunriseMinute;
    sunsetTime.innerText=sunsetHour+" : "+sunsetMinute;

    lengthOfDay.innerText=getDayLength(sunrise,sunset);

}

let loader=document.querySelector(".loader");
let whiteScreen=document.querySelector(".whiteScreen");
async function updateWeather(city,reportlat,reportlon){
    try{

        let url;
        if (!hasGeoLocation){
            url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Key}&units=metric`;
        }
        else{
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${reportlat}&lon=${reportlon}&appid=${Key}&units=metric`;
            hasGeoLocation=false;

        }
        

        //weather Condition
        loader.classList.replace("hidden","flex");
        whiteScreen.classList.replace("hidden","flex");

        let WeatherReport=await fetch (url);
        WeatherReport=await WeatherReport.json();

        if (WeatherReport.cod !=200){

            //removing loader and white screen if wrong city searched
            alert("Please enter a valid city Name");
            loader.classList.replace("flex","hidden");
            whiteScreen.classList.replace("flex","hidden");
        }


        //Pollution Condition
        let lat=WeatherReport.coord.lat;
        let lon=WeatherReport.coord.lon;
        let Pollution=`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${Key}&units=metric`;

        
        let pollutionReport=await fetch(Pollution);
        pollutionReport=await pollutionReport.json();

        //Hourly Forecast of the day

        let hourlyForecastUrl=`https://api.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${Key}&units=metric`;

        let hForecast=await fetch(hourlyForecastUrl);
        let hourlyForecast= await hForecast.json();


        //weekly forecast

        let weeklyForecastUrl=`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=17&appid=${Key}&units=metric`;

        let weeklyForecast=await fetch(weeklyForecastUrl);
        weeklyForecast=await weeklyForecast.json();

        //after weekly forecast has recieved data from api removing loader and screen
        loader.classList.replace("flex","hidden");
        whiteScreen.classList.replace("flex","hidden");

        

        //updating daily weather
        let CurrCode=WeatherReport.sys.country;
        
        countryCode.innerText=countryList[CurrCode][0];
        
        CityName.innerText=WeatherReport.name;

        WeatherDescription.forEach(element =>{
            element.innerText=WeatherReport.weather[0].description.toUpperCase();
        })

        latitude.innerText=lat.toFixed(2);
        longitude.innerText=lon.toFixed(2);
        temp.forEach(T =>{
            T.innerText=WeatherReport.main.temp.toFixed(1);
        })
        highTemp.innerText=WeatherReport.main.temp_max.toFixed(1);
        lowTemp.innerText=WeatherReport.main.temp_min.toFixed(1);
        tempFeels.innerText=WeatherReport.main.feels_like.toFixed(1);

        
        

        Img.forEach(img=>{
            let Icon=WeatherReport.weather[0].icon;
            img.src=`https://openweathermap.org/img/wn/${Icon}@4x.png`;
        })

        

        let dt=WeatherReport.dt;
        let timeZone=WeatherReport.timezone;
        let sunrise=WeatherReport.sys.sunrise;
        let sunset=WeatherReport.sys.sunset;

        DisplayTime(dt,timeZone,sunrise,sunset);

        //Updating Pressure Humidity Wind and Visibilty

        Pressure.innerText=WeatherReport.main.pressure+" hPa";
        Visibility.innerText=((WeatherReport.visibility)/1000)+" Km";
        windSpeed.innerText=WeatherReport.wind.speed +" m/s";
        Humidity.innerText=WeatherReport.main.humidity+"%";

        let aqiIndex=pollutionReport.list[0].main.aqi;


        AQIValue.innerText=aqiIndex;
        AQI.className=`AQI-des bg-gray-500 px-3 rounded-2xl ${getAQIClass(aqiIndex)}`;
        AQI.innerText=getAQIStatus(aqiIndex);

        //daily weather updated

        //updating gases value
        updateGases(pollutionReport);

        //update hourlyForecast
        updateHourlyForecast(hourlyForecast, timeZone, sunrise, sunset);

        //updating weeklyForecast

        updateWeeklyForecast(weeklyForecast,timeZone);
    }
    catch(error){
        console.log(error);
    }
}

function getAQIClass(aqi) {
    switch (aqi) {
        case 1: return "bg-green-500";  
        case 2: return "bg-lime-500";    
        case 3: return "bg-yellow-500";  
        case 4: return "bg-orange-500"; 
        case 5: return "bg-red-600"; 
        default: return "bg-gray-400";  
    }
}


function getAQIStatus(aqi){
    switch (aqi) {
        case 1: return "Good";   
        case 2: return "Fair";    
        case 3: return "Moderate"; 
        case 4: return "Poor";
        case 5: return "Very Poor";
        case 6:return "Hazardous"
        default: return "Hazardous";

    }
}


function updateGases(pollutionReport){

    let AQI_NO2=document.querySelector(".AQI-NO2")
    let AQI_O3=document.querySelector(".AQI-O3")
    let AQI_PM5=document.querySelector(".AQI-PM5")
    let AQI_NH3=document.querySelector(".AQI-NH3")
    let AQI_CO=document.querySelector(".AQI-CO")

    AQI_CO.innerText=pollutionReport.list[0].components.co;
    AQI_NH3.innerText=pollutionReport.list[0].components.nh3;
    AQI_PM5.innerText=pollutionReport.list[0].components.pm2_5;
    AQI_O3.innerText=pollutionReport.list[0].components.o3;
    AQI_NO2.innerText=pollutionReport.list[0].components.no2;
    
}

let hForecastSection=document.querySelector(".card-wrapper");

function updateHourlyForecast(hourlyForecast, timezone, sunrise, sunset) {

    for (let i = 0; i < 12; i++) {
        let forecast = hourlyForecast.list[i];

        // Format time
        let parts = formatWeatherTime(forecast.dt, timezone, sunrise, sunset);
        let hour = parts.find(p => p.type === "hour").value;
        let period = parts.find(p => p.type === "dayPeriod").value.toUpperCase();

        // Weather icon and temp
        let Icon = forecast.weather[0].icon;
        let maxTemp =forecast.main.temp_max.toFixed(1);
        let minTemp=forecast.main.temp_min.toFixed(1);

        // --- Create hourly forecast card ---
        let hfCard = document.createElement('div');
        hfCard.className = "hf-card bg-transition-dark max-[980px]:w-[30%] max-[770px]:w-[15%] max-[680px]:w-[18%] max-[580px]:w-[20%] max-[500px]:w-[22%] max-[420px]:w-[25%]";

        // Time
        let hfTime = document.createElement('div');
        hfTime.className = "hf-time h-[10%] w-full text-2xl text-center font-xl Story-font";
        hfTime.innerText = hour + period;

        // Weather image
        let hfWeather = document.createElement('div');
        hfWeather.className = "hf-weather h-[50%] w-full";
        let weatherImg = document.createElement('img');
        weatherImg.src = `https://openweathermap.org/img/wn/${Icon}@4x.png`;
        weatherImg.className = "h-full w-full object-cover object-center";
        hfWeather.appendChild(weatherImg);

        // Temperature
        let hftemp = document.createElement('div');
        hftemp.className = "hf-temp h-[10%] w-full text-[15px] Story-font text-center";

        let tempSpan = document.createElement('span');
        tempSpan.className = "temp";
        tempSpan.innerText = maxTemp+"/"+minTemp;

        hftemp.appendChild(tempSpan);
        hftemp.appendChild(document.createTextNode(" °C"));

        // Append all to card
        hfCard.appendChild(hfTime);
        hfCard.appendChild(hfWeather);
        hfCard.appendChild(hftemp);

        // Append card to forecast section
        hForecastSection.appendChild(hfCard);
    }
    HourlyForecastWidth=hForecastSection.scrollWidth;
}
let weeklyForecastSection = document.querySelector(".weekly-wrapper-class");
function updateWeeklyForecast(weeklyForecast, timezone) {
    // Clear existing weekly cards
    weeklyForecastSection.innerHTML = "";

    // Loop through 17 days (or however many are returned)
    for (let i = 0; i < 17; i++) {
        let forecast = weeklyForecast.list[i];

        // Format day name
        let parts = formatWeatherTime(forecast.dt, timezone);
        let dayName = parts.find(p => p.type === "weekday").value.substring(0,3);

        // Weather icon and temps
        let Icon = forecast.weather[0].icon;
        let tempMax = forecast.temp.max.toFixed(1);
        let tempMin = forecast.temp.min.toFixed(1);

        // --- Create weekly forecast card ---
        let weeklyCard = document.createElement('div');
        weeklyCard.className = "weekly-card bg-transition-dark flex flex-col items-center w-[12%] justify-between rounded-xl p-2 text-white max-[1200px]:w-[15%] max-[950px]:w-[18%] max-[850px]:w-[21%] max-[690px]:w-[24%] max-[550px]:w-[30%] max-[550px]:w-[30%] max-[380px]:w-[33%] ";

        // Day
        let dayDiv = document.createElement('div');
        dayDiv.className = "weekly-day font-semibold text-center";
        dayDiv.innerText = dayName;

        // Weather image
        let weatherDiv = document.createElement('div');
        weatherDiv.className = "weekly-weather h-[50%] w-full";
        let weatherImg = document.createElement('img');
        weatherImg.src = `https://openweathermap.org/img/wn/${Icon}@4x.png`;
        weatherImg.className = "h-full w-full object-cover object-center";
        weatherDiv.appendChild(weatherImg);

        // Temperature
        let tempDiv = document.createElement('div');
        tempDiv.className = "weekly-temp text-center mt-1";
        tempDiv.innerHTML = `<span class="temp-max font-bold">${tempMax}</span>° / <span class="temp-min text-gray-400 ml-1">${tempMin}</span>°C`;

        // Append everything to weekly card
        weeklyCard.appendChild(dayDiv);
        weeklyCard.appendChild(weatherDiv);
        weeklyCard.appendChild(tempDiv);

        // Append weekly card to the container
        weeklyForecastSection.appendChild(weeklyCard);
    }
}
let HourlyLeftBtn = document.querySelector(".left-btn");
let HourlyRightBtn = document.querySelector(".right-btn");
const Hwrapper = document.querySelector(".card-wrapper"); // Added missing dot

let counter = 0;
let move = 200;

HourlyRightBtn.addEventListener("click", () => {
    scroll(1,Hwrapper);

});

HourlyLeftBtn.addEventListener("click", () => {
    scroll(-1,Hwrapper);

});

let WeeklyRBtn=document.querySelector(".weekly-right-btn");
let WeeklyLBtn=document.querySelector(".weekly-left-btn");
let Wwrapper=document.querySelector(".weekly-wrapper-class");

 WeeklyRBtn.addEventListener("click",()=>{
    

    scroll(1,Wwrapper);
 })

 WeeklyLBtn.addEventListener("click",()=>{
    scroll(-1,Wwrapper);
 })





function scroll(direction,wrapper){
    let width = wrapper.scrollWidth - wrapper.clientWidth;

    if(direction===1){
        if (counter + move <= width) {
            counter += move;
        } else {
            counter = width;
        }
    }
    else{
        if(counter-move>=0){
            counter -=move;
        }
        else{
            counter=0;
        }
    }
    wrapper.style.transform = `translateX(-${counter}px)`; // Added parentheses around translateX() and negative sign to move left

}


// Code to View btns on mobile when wrapper is touched 
let hidetimeout;
function showbtns(leftBtn,rightBtn){
    leftBtn.classList.remove('hidden');
    rightBtn.classList.remove('hidden');

    clearTimeout(hidetimeout);
  // Hide again after 3 seconds of inactivity
    hidetimeout=setTimeout(() => {
        leftBtn.classList.add('hidden');
        rightBtn.classList.add('hidden');
    }, 3000);

}

Hwrapper.addEventListener('touchstart', () => {
    showbtns(HourlyLeftBtn,HourlyRightBtn);

});

Wwrapper.addEventListener('touchstart',()=>{
    showbtns(WeeklyLBtn,WeeklyRBtn);
})